/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from 'react';
import axios from '@mapstore/framework/libs/ajax';
import { deleteExecutionRequest } from '@js/api/geonode/v2';

const useExecutionRequest = ({
    api,
    forceRequests,
    refreshTime,
    onRefresh = () => {}
}) => {
    const isMounted = useRef(true);
    const [requests, setRequests] = useState([]);
    const _onRefresh = useRef();
    _onRefresh.current = onRefresh;
    useEffect(() => {
        isMounted.current = true;
        const updateExecutions = () => {
            axios.get(api.url, {
                params: {
                    page_size: 9999,
                    ...api.params
                }
            })
                .then(({ data }) => {
                    if (isMounted.current) {
                        setRequests(data?.requests || []);
                        _onRefresh.current(data?.requests);
                    }
                });
        };
        updateExecutions();
        const interval = setInterval(() => {
            updateExecutions();
        }, refreshTime);
        return () => {
            clearInterval(interval);
            isMounted.current = false;
        };
    }, [refreshTime, forceRequests]);

    return {
        requests,
        deleteRequest: (id) => {
            if (isMounted.current) {
                setRequests(prevRequests => prevRequests.filter(request => request.exec_id !== id));
            }
            deleteExecutionRequest(id);
        }
    };
};

export default useExecutionRequest;
