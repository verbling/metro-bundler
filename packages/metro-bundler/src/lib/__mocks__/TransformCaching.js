/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const crypto = require('crypto');
const jsonStableStringify = require('json-stable-stringify');

const transformCache = new Map();

const transformCacheKeyOf = props =>
  props.filePath + '-' + crypto.createHash('md5')
    .update(props.sourceCode)
    .update(props.getTransformCacheKey(props.sourceCode, props.filePath, props.transformOptions))
    .update(jsonStableStringify(props.transformOptions || {}))
    .digest('hex');

class TransformCacheMock {

  constructor() {
    this.mock = {
      lastWrite: null,
      reset: () => {
        transformCache.clear();
        this.mock.lastWrite = null;
      },
    };
  }

  writeSync(props) {
    transformCache.set(transformCacheKeyOf(props), props.result);
    this.mock.lastWrite = props;
  }

  readSync(props) {
    return {result: transformCache.get(transformCacheKeyOf(props)), outdatedDependencies: []};
  }

}

module.exports = {mocked: () => new TransformCacheMock()};
