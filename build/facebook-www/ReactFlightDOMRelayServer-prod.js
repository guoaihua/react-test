/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @nolint
 * @preventMunge
 * @preserve-invariant-messages
 */

"use strict";
var ReactFlightDOMRelayServerIntegration = require("ReactFlightDOMRelayServerIntegration"),
  React = require("react");
function formatProdErrorMessage(code) {
  for (
    var url = "https://reactjs.org/docs/error-decoder.html?invariant=" + code,
      i = 1;
    i < arguments.length;
    i++
  )
    url += "&args[]=" + encodeURIComponent(arguments[i]);
  return (
    "Minified React error #" +
    code +
    "; visit " +
    url +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
function convertModelToJSON(request, parent, key, model) {
  parent = resolveModelToJSON(request, parent, key, model);
  if ("object" === typeof parent && null !== parent) {
    if (Array.isArray(parent)) {
      var jsonArray = [];
      for (key = 0; key < parent.length; key++)
        jsonArray[key] = convertModelToJSON(
          request,
          parent,
          "" + key,
          parent[key]
        );
      return jsonArray;
    }
    key = {};
    for (jsonArray in parent)
      key[jsonArray] = convertModelToJSON(
        request,
        parent,
        jsonArray,
        parent[jsonArray]
      );
    return key;
  }
  return parent;
}
function processModelChunk(request, id, model) {
  request = convertModelToJSON(request, {}, "", model);
  return { type: "json", id: id, json: request };
}
function writeChunk(destination, chunk) {
  "json" === chunk.type
    ? ReactFlightDOMRelayServerIntegration.emitModel(
        destination,
        chunk.id,
        chunk.json
      )
    : ReactFlightDOMRelayServerIntegration.emitError(
        destination,
        chunk.id,
        chunk.json.message,
        chunk.json.stack
      );
  return !0;
}
var REACT_ELEMENT_TYPE = 60103,
  REACT_FRAGMENT_TYPE = 60107,
  REACT_STRICT_MODE_TYPE = 60108,
  REACT_PROFILER_TYPE = 60114,
  REACT_FORWARD_REF_TYPE = 60112,
  REACT_SUSPENSE_TYPE = 60113,
  REACT_SUSPENSE_LIST_TYPE = 60120,
  REACT_MEMO_TYPE = 60115,
  REACT_LAZY_TYPE = 60116,
  REACT_BLOCK_TYPE = 60121,
  REACT_SERVER_BLOCK_TYPE = 60122,
  REACT_SCOPE_TYPE = 60119,
  REACT_DEBUG_TRACING_MODE_TYPE = 60129,
  REACT_OFFSCREEN_TYPE = 60130,
  REACT_LEGACY_HIDDEN_TYPE = 60131;
if ("function" === typeof Symbol && Symbol.for) {
  var symbolFor = Symbol.for;
  REACT_ELEMENT_TYPE = symbolFor("react.element");
  REACT_FRAGMENT_TYPE = symbolFor("react.fragment");
  REACT_STRICT_MODE_TYPE = symbolFor("react.strict_mode");
  REACT_PROFILER_TYPE = symbolFor("react.profiler");
  REACT_FORWARD_REF_TYPE = symbolFor("react.forward_ref");
  REACT_SUSPENSE_TYPE = symbolFor("react.suspense");
  REACT_SUSPENSE_LIST_TYPE = symbolFor("react.suspense_list");
  REACT_MEMO_TYPE = symbolFor("react.memo");
  REACT_LAZY_TYPE = symbolFor("react.lazy");
  REACT_BLOCK_TYPE = symbolFor("react.block");
  REACT_SERVER_BLOCK_TYPE = symbolFor("react.server.block");
  REACT_SCOPE_TYPE = symbolFor("react.scope");
  REACT_DEBUG_TRACING_MODE_TYPE = symbolFor("react.debug_trace_mode");
  REACT_OFFSCREEN_TYPE = symbolFor("react.offscreen");
  REACT_LEGACY_HIDDEN_TYPE = symbolFor("react.legacy_hidden");
}
var ReactCurrentDispatcher =
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    .ReactCurrentDispatcher;
function createRequest(model, destination, bundlerConfig) {
  var pingedSegments = [],
    request = {
      destination: destination,
      bundlerConfig: bundlerConfig,
      nextChunkId: 0,
      pendingChunks: 0,
      pingedSegments: pingedSegments,
      completedJSONChunks: [],
      completedErrorChunks: [],
      flowing: !1,
      toJSON: function(key, value) {
        return resolveModelToJSON(request, this, key, value);
      }
    };
  request.pendingChunks++;
  destination = createSegment(request, function() {
    return model;
  });
  pingedSegments.push(destination);
  return request;
}
function attemptResolveElement(element) {
  var type = element.type,
    props = element.props;
  if ("function" === typeof type) return type(props);
  if ("string" === typeof type || type[0] === REACT_SERVER_BLOCK_TYPE)
    return [REACT_ELEMENT_TYPE, type, element.key, element.props];
  if (
    type === REACT_FRAGMENT_TYPE ||
    type === REACT_STRICT_MODE_TYPE ||
    type === REACT_PROFILER_TYPE ||
    type === REACT_SCOPE_TYPE ||
    type === REACT_DEBUG_TRACING_MODE_TYPE ||
    type === REACT_LEGACY_HIDDEN_TYPE ||
    type === REACT_OFFSCREEN_TYPE ||
    type === REACT_SUSPENSE_TYPE ||
    type === REACT_SUSPENSE_LIST_TYPE
  )
    return element.props.children;
  if (null != type && "object" === typeof type)
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        return (element = type.render), element(props, void 0);
      case REACT_MEMO_TYPE:
        return (
          (props = React.createElement(type.type, element.props)),
          attemptResolveElement(props)
        );
    }
  throw Error(formatProdErrorMessage(351));
}
function createSegment(request, query) {
  var segment = {
    id: request.nextChunkId++,
    query: query,
    ping: function() {
      var pingedSegments = request.pingedSegments;
      pingedSegments.push(segment);
      1 === pingedSegments.length && performWork(request);
    }
  };
  return segment;
}
function resolveModelToJSON(request, parent, key, value) {
  switch (value) {
    case REACT_ELEMENT_TYPE:
      return "$";
    case REACT_SERVER_BLOCK_TYPE:
      return "@";
    case REACT_LAZY_TYPE:
    case REACT_BLOCK_TYPE:
      throw Error(formatProdErrorMessage(352));
  }
  if (parent[0] === REACT_SERVER_BLOCK_TYPE)
    switch (key) {
      case "1":
        try {
          return ReactFlightDOMRelayServerIntegration.resolveModuleMetaData(
            request.bundlerConfig,
            value
          );
        } catch (x) {
          return (
            request.pendingChunks++,
            (parent = request.nextChunkId++),
            emitErrorChunk(request, parent, x),
            "$" + parent.toString(16)
          );
        }
      case "2":
        parent = value;
        try {
          return parent();
        } catch (x$2) {
          if (
            "object" === typeof x$2 &&
            null !== x$2 &&
            "function" === typeof x$2.then
          )
            return (
              request.pendingChunks++,
              (request = createSegment(request, parent)),
              (parent = request.ping),
              x$2.then(parent, parent),
              "$" + request.id.toString(16)
            );
          request.pendingChunks++;
          parent = request.nextChunkId++;
          emitErrorChunk(request, parent, x$2);
          return "$" + parent.toString(16);
        }
      default:
        throw Error(formatProdErrorMessage(353));
    }
  if ("string" === typeof value)
    return (
      (request = "$" === value[0] || "@" === value[0] ? "$" + value : value),
      request
    );
  for (
    ;
    "object" === typeof value &&
    null !== value &&
    value.$$typeof === REACT_ELEMENT_TYPE;

  ) {
    parent = value;
    try {
      value = attemptResolveElement(parent);
    } catch (x$5) {
      if (
        "object" === typeof x$5 &&
        null !== x$5 &&
        "function" === typeof x$5.then
      )
        return (
          request.pendingChunks++,
          (request = createSegment(request, function() {
            return value;
          })),
          (parent = request.ping),
          x$5.then(parent, parent),
          "$" + request.id.toString(16)
        );
      throw x$5;
    }
  }
  return value;
}
function emitErrorChunk(request, id, error) {
  var stack = "";
  try {
    if (error instanceof Error) {
      var message = "" + error.message;
      stack = "" + error.stack;
    } else message = "Error: " + error;
  } catch (x) {
    message = "An error occurred but serializing the error message failed.";
  }
  request.completedErrorChunks.push({
    type: "error",
    id: id,
    json: { message: message, stack: stack }
  });
}
function retrySegment(request, segment) {
  var query = segment.query,
    value;
  try {
    for (
      value = query();
      "object" === typeof value &&
      null !== value &&
      value.$$typeof === REACT_ELEMENT_TYPE;

    )
      (query = value),
        (segment.query = function() {
          return value;
        }),
        (value = attemptResolveElement(query));
    var processedChunk = processModelChunk(request, segment.id, value);
    request.completedJSONChunks.push(processedChunk);
  } catch (x) {
    "object" === typeof x && null !== x && "function" === typeof x.then
      ? ((request = segment.ping), x.then(request, request))
      : emitErrorChunk(request, segment.id, x);
  }
}
function performWork(request) {
  var prevDispatcher = ReactCurrentDispatcher.current;
  ReactCurrentDispatcher.current = Dispatcher;
  var pingedSegments = request.pingedSegments;
  request.pingedSegments = [];
  for (var i = 0; i < pingedSegments.length; i++)
    retrySegment(request, pingedSegments[i]);
  if (request.flowing && !reentrant) {
    reentrant = !0;
    pingedSegments = request.destination;
    try {
      var jsonChunks = request.completedJSONChunks;
      for (i = 0; i < jsonChunks.length; i++)
        if (
          (request.pendingChunks--, !writeChunk(pingedSegments, jsonChunks[i]))
        ) {
          request.flowing = !1;
          i++;
          break;
        }
      jsonChunks.splice(0, i);
      var errorChunks = request.completedErrorChunks;
      for (i = 0; i < errorChunks.length; i++)
        if (
          (request.pendingChunks--, !writeChunk(pingedSegments, errorChunks[i]))
        ) {
          request.flowing = !1;
          i++;
          break;
        }
      errorChunks.splice(0, i);
    } finally {
      reentrant = !1;
    }
    0 === request.pendingChunks &&
      ReactFlightDOMRelayServerIntegration.close(pingedSegments);
  }
  ReactCurrentDispatcher.current = prevDispatcher;
}
var reentrant = !1;
function unsupportedHook() {
  throw Error(formatProdErrorMessage(373));
}
var Dispatcher = {
  useMemo: function(nextCreate) {
    return nextCreate();
  },
  useCallback: function(callback) {
    return callback;
  },
  useDebugValue: function() {},
  useDeferredValue: function(value) {
    return value;
  },
  useTransition: function() {
    return [function() {}, !1];
  },
  readContext: unsupportedHook,
  useContext: unsupportedHook,
  useReducer: unsupportedHook,
  useRef: unsupportedHook,
  useState: unsupportedHook,
  useLayoutEffect: unsupportedHook,
  useImperativeHandle: unsupportedHook,
  useEffect: unsupportedHook,
  useOpaqueIdentifier: unsupportedHook,
  useMutableSource: unsupportedHook
};
exports.render = function(model, destination, config) {
  model = createRequest(model, destination, config);
  model.flowing = !0;
  performWork(model);
};
