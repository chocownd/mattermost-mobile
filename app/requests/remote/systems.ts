// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MM_TABLES} from '@constants/database';
import DatabaseManager from '@database/manager';
import {Q} from '@nozbe/watermelondb';
import {logError} from '@requests/remote/error';
import {forceLogoutIfNecessary} from '@requests/remote/user';

export const getDataRetentionPolicy = async () => {
    let data;
    try {
        data = await Client4.getDataRetentionPolicy();
    } catch (error) {
        forceLogoutIfNecessary(error);

        //fixme: do we care for the below line ?  It seems that the `error` object is never read ??
        // dispatch(batchActions([{type: GeneralTypes.RECEIVED_DATA_RETENTION_POLICY, error,},]));
        logError(error);
        return {error};
    }

    //todo: save  data to dataRetentionPolicy  under systems entity

    return {data};
};

export const loadConfigAndLicense = async () => {
    const database = DatabaseManager.getActiveServerDatabase();
    if (database) {
        try {
            const currentUserId = await database.collections.
                get(MM_TABLES.SERVER.SYSTEM).
                query(Q.where('name', 'currentUserId')).
                fetch();

            if (currentUserId[0]) {
                const [config, license] = await Promise.all([
                    Client4.getClientConfigOld(),
                    Client4.getClientLicenseOld(),
                ]);

                //todo:  save config in systems entity
                //todo:  save license in systems entity

                if (
                    config.DataRetentionEnableMessageDeletion &&
                    config.DataRetentionEnableMessageDeletion === 'true' &&
                    license.IsLicensed === 'true' &&
                    license.DataRetention === 'true'
                ) {
                    //fixme: should we await this one ?  => NO
                    await getDataRetentionPolicy();
                } else {
                    //todo: save  dataRetentionPolicy: {} under systems entity
                }
            }
        } catch (error) {
            //todo:
            logError(error);
        }
    }
};