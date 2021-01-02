# coding: utf-8
#
# Copyright 2017 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""One-off jobs for collections."""

from __future__ import absolute_import  # pylint: disable=import-only-modules
from __future__ import unicode_literals  # pylint: disable=import-only-modules

import ast
import logging

from core import jobs
from core.domain import collection_domain
from core.domain import collection_services
from core.platform import models
import feconf
import python_utils

(base_models, collection_models,) = models.Registry.import_models([
    models.NAMES.base_model, models.NAMES.collection])


class CollectionMigrationOneOffJob(jobs.BaseMapReduceOneOffJobManager):
    """A reusable one-time job that may be used to migrate collection schema
    versions. This job will load all existing collections from the data store
    and immediately store them back into the data store. The loading process of
    a collection in collection_services automatically performs schema updating.
    This job persists that conversion work, keeping collections up-to-date and
    improving the load time of new collections.
    """

    _DELETED_KEY = 'collection_deleted'
    _ERROR_KEY = 'validation_error'
    _MIGRATED_KEY = 'collection_migrated'

    @classmethod
    def entity_classes_to_map_over(cls):
        return [collection_models.CollectionModel]

    @staticmethod
    def map(item):
        if item.deleted:
            yield (CollectionMigrationOneOffJob._DELETED_KEY, 1)
            return

        # Note: the read will bring the collection up to the newest version.
        collection = collection_services.get_collection_by_id(item.id)
        try:
            collection.validate(strict=False)
        except Exception as e:
            logging.error(
                'Collection %s failed validation: %s' % (item.id, e))
            yield (
                CollectionMigrationOneOffJob._ERROR_KEY,
                'Collection %s failed validation: %s' % (item.id, e))
            return

        # Write the new collection into the datastore if it's different from
        # the old version.
        #
        # Note: to_version really should be int, but left as str to conform
        # with legacy data.
        if item.schema_version <= feconf.CURRENT_COLLECTION_SCHEMA_VERSION:
            commit_cmds = [{
                'cmd': collection_domain.CMD_MIGRATE_SCHEMA_TO_LATEST_VERSION,
                'from_version': item.schema_version,
                'to_version': python_utils.UNICODE(
                    feconf.CURRENT_COLLECTION_SCHEMA_VERSION)
            }]
            collection_services.update_collection(
                feconf.MIGRATION_BOT_USERNAME, item.id, commit_cmds,
                'Update collection schema version to %d.' % (
                    feconf.CURRENT_COLLECTION_SCHEMA_VERSION))
            yield (CollectionMigrationOneOffJob._MIGRATED_KEY, 1)

    @staticmethod
    def reduce(key, values):
        if key == CollectionMigrationOneOffJob._DELETED_KEY:
            yield (key, ['Encountered %d deleted collections.' % (
                sum(ast.literal_eval(v) for v in values))])
        elif key == CollectionMigrationOneOffJob._MIGRATED_KEY:
            yield (key, ['%d collections successfully migrated.' % (
                sum(ast.literal_eval(v) for v in values))])
        else:
            yield (key, values)


class RemoveCollectionRightsTranslatorIdsOneOffJob(
        jobs.BaseMapReduceOneOffJobManager):
    """Job that sets the translator_ids in *CollectionRightsModel to None
    in order to remove it from the datastore.
    """

    @classmethod
    def enqueue(cls, job_id, additional_job_params=None):
        super(RemoveCollectionRightsTranslatorIdsOneOffJob, cls).enqueue(
            job_id, shard_count=64)

    @classmethod
    def entity_classes_to_map_over(cls):
        return [
            collection_models.CollectionRightsModel
        ]

    @staticmethod
    def map(collection_rights_model):
        # This is the only way to remove the field from the model,
        # see https://stackoverflow.com/a/15116016/3688189 and
        # https://stackoverflow.com/a/12701172/3688189.
        if 'translator_ids' in collection_rights_model._properties:  # pylint: disable=protected-access
            del collection_rights_model._properties['translator_ids']  # pylint: disable=protected-access
            if 'translator_ids' in collection_rights_model._values:  # pylint: disable=protected-access
                del collection_rights_model._values['translator_ids']  # pylint: disable=protected-access
            collection_rights_model.update_timestamps(
                update_last_updated_time=False)
            yield (
                'SUCCESS_REMOVED - CollectionRightsModel',
                collection_rights_model.id)
        else:
            yield (
                'SUCCESS_ALREADY_REMOVED - CollectionRightsModel',
                collection_rights_model.id)

    @staticmethod
    def reduce(key, values):
        """Implements the reduce function for this job."""
        yield (key, len(values))


class RemoveCollectionModelNodesOneOffJob(jobs.BaseMapReduceOneOffJobManager):
    """Job that sets the nodes in *CollectionModel to None in order to
    remove it from the datastore.
    """

    @classmethod
    def enqueue(cls, job_id, additional_job_params=None):
        super(RemoveCollectionModelNodesOneOffJob, cls).enqueue(
            job_id, shard_count=64)

    @classmethod
    def entity_classes_to_map_over(cls):
        return [
            collection_models.CollectionModel
        ]

    @staticmethod
    def map(collection_model):
        # This is the only way to remove the field from the model,
        # see https://stackoverflow.com/a/15116016/3688189 and
        # https://stackoverflow.com/a/12701172/3688189.
        if 'nodes' in collection_model._properties:  # pylint: disable=protected-access
            del collection_model._properties['nodes']  # pylint: disable=protected-access
            if 'nodes' in collection_model._values:  # pylint: disable=protected-access
                del collection_model._values['nodes']  # pylint: disable=protected-access
            # collection_model.update_timestamps(update_last_updated_time=False)
            # collection_model.put()
            collection_model.nodes = None
            commit_cmds = [{
                'cmd' : collection_domain.CMD_REMOVE_NODE
            }]
            collection_services.update_collection(
                feconf.MIGRATION_BOT_USERNAME, collection_model.id, commit_cmds,
                'remove nodes from collection')
            yield ('SUCCESS_REMOVED - CollectionModel', collection_model.id)
        else:
            yield (
                'SUCCESS_ALREADY_REMOVED - CollectionModel',
                collection_model.id)

    @staticmethod
    def reduce(key, values):
        """Implements the reduce function for this job."""
        yield (key, len(values))
