
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function getTriesAverage() {
        return parseInt(localStorage["triesSum"] || "0", 10) /
            parseInt(localStorage["tries"] || "1", 10);
    }

    function addTryResult(n) {
        setTriesAverage(`${parseInt(localStorage["triesSum"] || "0", 10) + n}`,
            `${parseInt(localStorage["tries"] || "0", 10) + 1}`);
        return getTriesAverage();
    }

    function setTriesAverage(sum, tires) {
        localStorage["triesSum"] = sum.toString();
        localStorage["tries"] = tires.toString();
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var index_umd = createCommonjsModule(function (module, exports) {
    !function(e,n){n(exports);}(commonjsGlobal,function(e){var a=function(){return (a=Object.assign||function(e){for(var n,t=1,o=arguments.length;t<o;t++)for(var r in n=arguments[t])Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r]);return e}).apply(this,arguments)};function s(){for(var e=0,n=0,t=arguments.length;n<t;n++)e+=arguments[n].length;var o=Array(e),r=0;for(n=0;n<t;n++)for(var p=arguments[n],i=0,a=p.length;i<a;i++,r++)o[r]=p[i];return o}function u(p,e){var o,r,i=(o={current:0,next:function(){return ++this.current}},r={},{add:function(e,n){var t=null!=n?n:o.next();return r[t]=e,t},resolve:function(e,n,t){var o=r[e];o&&(t(n)?o.resolve(n):o.reject(n),r[e]=null);}});return e(function(e){if(e.detail&&e.detail.data&&"object"==typeof e.detail.data&&"request_id"in e.detail.data){var n=e.detail.data,t=n.request_id,o=function(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)n.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(t[o[r]]=e[o[r]]);}return t}(n,["request_id"]);t&&i.resolve(t,o,function(e){return !("error_type"in e)});}}),function(o,r){return void 0===r&&(r={}),new Promise(function(e,n){var t=i.add({resolve:e,reject:n},r.request_id);p(o,a(a({},r),{request_id:t}));})}}var n="undefined"!=typeof window,d=Boolean(n&&window.AndroidBridge),l=Boolean(n&&window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.VKWebAppClose),b=n&&!d&&!l,t=b&&/(^\?|&)vk_platform=mobile_web(&|$)/.test(location.search),c=b?"message":"VKWebAppEvent",f=s(["VKWebAppInit","VKWebAppGetCommunityAuthToken","VKWebAppAddToCommunity","VKWebAppAddToHomeScreenInfo","VKWebAppClose","VKWebAppCopyText","VKWebAppCreateHash","VKWebAppGetUserInfo","VKWebAppSetLocation","VKWebAppSendToClient","VKWebAppGetClientVersion","VKWebAppGetPhoneNumber","VKWebAppGetEmail","VKWebAppGetGroupInfo","VKWebAppGetGeodata","VKWebAppGetCommunityToken","VKWebAppGetConfig","VKWebAppGetLaunchParams","VKWebAppSetTitle","VKWebAppGetAuthToken","VKWebAppCallAPIMethod","VKWebAppJoinGroup","VKWebAppLeaveGroup","VKWebAppAllowMessagesFromGroup","VKWebAppDenyNotifications","VKWebAppAllowNotifications","VKWebAppOpenPayForm","VKWebAppOpenApp","VKWebAppShare","VKWebAppShowWallPostBox","VKWebAppScroll","VKWebAppShowOrderBox","VKWebAppShowLeaderBoardBox","VKWebAppShowInviteBox","VKWebAppShowRequestBox","VKWebAppAddToFavorites","VKWebAppShowCommunityWidgetPreviewBox","VKWebAppShowStoryBox","VKWebAppStorageGet","VKWebAppStorageGetKeys","VKWebAppStorageSet","VKWebAppFlashGetInfo","VKWebAppSubscribeStoryApp","VKWebAppOpenWallPost","VKWebAppCheckAllowedScopes","VKWebAppShowNativeAds","VKWebAppRetargetingPixel","VKWebAppConversionHit"],b&&!t?["VKWebAppResizeWindow","VKWebAppAddToMenu","VKWebAppShowSubscriptionBox","VKWebAppShowInstallPushBox","VKWebAppGetFriends"]:["VKWebAppShowImages"]),A=n?window.AndroidBridge:void 0,m=l?window.webkit.messageHandlers:void 0;var o,r,p,i;function W(e,n){var t=n||{bubbles:!1,cancelable:!1,detail:void 0},o=document.createEvent("CustomEvent");return o.initCustomEvent(e,!!t.bubbles,!!t.cancelable,t.detail),o}(o=e.EGrantedPermission||(e.EGrantedPermission={})).CAMERA="camera",o.LOCATION="location",o.PHOTO="photo",(r=e.EGetLaunchParamsResponseLanguages||(e.EGetLaunchParamsResponseLanguages={})).RU="ru",r.UK="uk",r.UA="ua",r.EN="en",r.BE="be",r.KZ="kz",r.PT="pt",r.ES="es",(p=e.EGetLaunchParamsResponseGroupRole||(e.EGetLaunchParamsResponseGroupRole={})).ADMIN="admin",p.EDITOR="editor",p.MEMBER="member",p.MODER="moder",p.NONE="none",(i=e.EGetLaunchParamsResponsePlatforms||(e.EGetLaunchParamsResponsePlatforms={})).DESKTOP_WEB="desktop_web",i.MOBILE_WEB="mobile_web",i.MOBILE_ANDROID="mobile_android",i.MOBILE_ANDROID_MESSENGER="mobile_android_messenger",i.MOBILE_IPHONE="mobile_iphone",i.MOBILE_IPHONE_MESSENGER="mobile_iphone_messenger",i.MOBILE_IPAD="mobile_ipad","undefined"==typeof window||window.CustomEvent||(window.CustomEvent=(W.prototype=Event.prototype,W));var w=function(t){var p=void 0,i=[];function e(e){i.push(e);}function n(){return l||d}function o(){return b&&window.parent!==window}function r(){return n()||o()}"undefined"!=typeof window&&"addEventListener"in window&&window.addEventListener(c,function(n){if(l||d)return s(i).map(function(e){return e.call(null,n)});if(b&&n&&n.data){var e=n.data,t=e.type,o=e.data,r=e.frameId;t&&"SetSupportedHandlers"===t?o.supportedHandlers:t&&"VKWebAppSettings"===t?p=r:s(i).map(function(e){return e({detail:{type:t,data:o}})});}});var a=u(function(e,n){A&&A[e]?A[e](JSON.stringify(n)):m&&m[e]&&"function"==typeof m[e].postMessage?m[e].postMessage(n):b&&parent.postMessage({handler:e,params:n,type:"vk-connect",webFrameId:p,connectVersion:t},"*");},e);return {send:a,sendPromise:a,subscribe:e,unsubscribe:function(e){var n=i.indexOf(e);-1<n&&i.splice(n,1);},supports:function(e){return d?!(!A||"function"!=typeof A[e]):l?!(!m||!m[e]||"function"!=typeof m[e].postMessage):b&&-1<f.indexOf(e)},isWebView:n,isIframe:o,isEmbedded:r,isStandalone:function(){return !r()}}}("2.5.3");e.applyMiddleware=function e(){for(var o=[],n=0;n<arguments.length;n++)o[n]=arguments[n];return o.includes(void 0)||o.includes(null)?e.apply(void 0,o.filter(function(e){return "function"==typeof e})):function(t){if(0===o.length)return t;var e,n={subscribe:t.subscribe,send:function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];return t.send.apply(t,e)}};return e=o.filter(function(e){return "function"==typeof e}).map(function(e){return e(n)}).reduce(function(n,t){return function(e){return n(t(e))}})(t.send),a(a({},t),{send:e})}},e.default=w,Object.defineProperty(e,"__esModule",{value:!0});});

    });

    var bridge = /*@__PURE__*/getDefaultExportFromCjs(index_umd);

    const vnd = {
        handleVictory: function () {
        },
        init: function () {
        },
        handleNewGame: function () {
        }
    };
    {
        let gameNum = 0;
        let token = "";
        let userId = 0;

        vnd.init = function () {
            bridge.send('VKWebAppInit')
                .then(r => {
                    bridge.send("VKWebAppStorageGet", {"keys": ["triesSum", "tries"]})
                        .then(VKWebAppStorageGet =>
                            (VKWebAppStorageGet.keys || []).forEach(v => {
                                switch (v.key) {
                                    case "triesSum":
                                        localStorage["triesSum"] = v.value;
                                        break
                                    case "tries":
                                        localStorage["tries"] = v.value;
                                        break
                                }
                            }))
                        .catch(console.log);

                    bridge.send("VKWebAppGetAuthToken", {"app_id": 8061331, "scope": ""})
                        .then(VKWebAppGetAuthToken => token = VKWebAppGetAuthToken.access_token)
                        .catch(console.log);

                    bridge.send("VKWebAppGetUserInfo")
                        .then(VKWebAppGetUserInfo => userId = VKWebAppGetUserInfo.id)
                        .catch(console.log);
                })
                .catch(console.log);
        };

        vnd.handleVictory = async function (newResult, prevResult) {
            await bridge.send("VKWebAppStorageSet", {
                key: "score",
                value: newResult.toString()
            });


            let score = 10000 - Math.floor(newResult * 1000);
            await bridge.send("VKWebAppCallAPIMethod", {
                "method": "secure.addAppEvent",
                "request_id": Date.now().toString(),
                "params": {
                    user_id: userId,
                    activity_id: 2,
                    value: score,
                    access_token: token
                }
            });

            await bridge.send("VKWebAppShowLeaderBoardBox", {user_result: score});
        };

        vnd.handleNewGame = async function () {
            if (gameNum % 2 === 1) {
                await bridge.send("VKWebAppShowNativeAds", {ad_format: "interstitial"});
            }
            gameNum++;
        };
    }

    const model = writable({});

    const kRet = "\u23ce";
    const kBsp = "\u232b";

    const kMsgWordNotInDictionary = "kMsgWordNotInDictionary";
    const kMsgLetterMissed = "kMsgLetterMissed";
    const kMsgInsufficientLetter = "kMsgInsufficientLetter";
    const kMsgWrongLetterPosition = "kMsgWrongLetterPosition";

    const kScreenGame = 0;
    const kScreenHelp = 1;
    const kScreenSettings = 2;

    const kStatusUnknown = 0;
    const kStatusAbsent = 1;
    const kStatusMisplaced = 2;
    const kStatusCorrect = 3;

    function createStore(dictionary, keyboard) {
        return {
            field: [],
            status: [],
            guessedWord: "",
            victory: false,
            defeat: false,
            currentWord: "",
            message: null,
            messageArgs: [],
            wordLen: 0,
            maxTries: 0,
            difficulty: 0,
            currentRow: 0,
            screen: kScreenGame,
            absentLetters: [],
            misplacedLetters: [],
            correctLetters: [],
            averageTries: 0,
            keyboard,

            init(wordLen, maxTries, difficulty) {
                this.difficulty = difficulty;
                const dict = dictionary[wordLen];
                this.guessedWord = dict[Math.floor(Math.random() * dict.length)];
                this.currentWord = "";
                this.currentRow = 0;
                this.defeat = false;
                this.victory = false;
                this.field = [...Array(maxTries)].map(_ => [...Array(wordLen)].map(_ => ""));
                this.status = [...Array(maxTries)].map(_ => [...Array(wordLen)].map(_ => kStatusUnknown));
                this.screen = kScreenGame;
                this.absentLetters = [];
                this.misplacedLetters = [];
                this.correctLetters = [];
                this._update();
                vnd.handleNewGame();
                return this;
            },

            insert(letter) {
                if (keyboard.indexOf(letter) < 0) {
                    return this;
                }
                switch (letter) {
                    case kRet:
                        this._testWord();
                        break;
                    case kBsp:
                        if (this.currentWord.length > 0) {
                            this.field[this.currentRow][this.currentWord.length - 1] = "";
                        }
                        break;
                    default:
                        if (this.currentWord.length < this.guessedWord.length) {
                            this._iterate((c, j, i) => ((this.field[j][i] = ((c === "_") ? letter : c)), (c === "_")));
                        }
                        break;
                }

                this._update();
                return this;
            },

            clearMessage() {
                this.message = null;
                this.messageArgs = [];
                return this;
            },

            setScreen(screen) {
                this.screen = screen;
                return this;
            },

            _update: function () {
                if (!this.victory && !this.defeat) {
                    this._fillRequiredChars();
                    this._updateCurrentWord();
                    this._placeMarker();
                }
                this._updateStatus();
            },

            _placeMarker() {
                this._iterate((c, j, i) => (this.field[j][i] = (c === "_") ? "" : c) && false);
                this._iterate((c, j, i) =>
                    ((this.field[j][i] = ((c === "" && j === this.currentRow) ? "_" : c)),
                        (c === "")));
            },

            _iterate(fn) {
                for (let j = 0; j < this.field.length; j++) {
                    for (let i = 0; i < this.field[j].length; i++) {
                        if (fn(this.field[j][i], j, i)) {
                            return
                        }
                    }
                }
            },

            _updateCurrentWord: function () {
                this.currentWord = this.field[this.currentRow].join("").replace("_", "");
            },

            _testWord() {
                if (this.currentWord.length !== this.guessedWord.length) {
                    return;
                }

                if (this.difficulty >= 0) {
                    if (dictionary[this.guessedWord.length].indexOf(this.currentWord) < 0) {
                        this.message = kMsgWordNotInDictionary;
                        this.messageArgs = [this.currentWord];
                        this._clearRow();
                        return;
                    }
                }

                if (this.difficulty > 0) {
                    for (let c of this.misplacedLetters) {
                        if (this.currentWord.indexOf(c) < 0) {
                            this.message = kMsgLetterMissed;
                            this.messageArgs = [c];
                            this._clearRow();
                            return;
                        }
                    }
                    for (let c of this.absentLetters) {
                        if (this.currentWord.indexOf(c) >= 0) {
                            this.message = kMsgInsufficientLetter;
                            this.messageArgs = [c];
                            this._clearRow();
                            return;
                        }
                    }
                    for (let i = 0; i < this.currentWord.length; i++) {
                        const c = this.currentWord[i];
                        if ((this.guessedWord[i] !== c) && (this.correctLetters.indexOf(c) >= 0)) {
                            for (let j = 0; j < this.currentRow; j++) {
                                if (this.field[j][i] === c) {
                                    this.message = kMsgWrongLetterPosition;
                                    this.messageArgs = [c];
                                    this._clearRow();
                                    return;
                                }
                            }
                        }
                    }
                }

                this.currentRow++;
                if (!this.victory) {
                    this.victory = this.currentWord === this.guessedWord;
                    const prev = getTriesAverage();
                    this.averageTries = addTryResult(this.currentRow);
                    vnd.handleVictory(this.averageTries, prev);
                }
                this.defeat = !this.victory && this.currentRow >= this.field.length;
                this._updateLetters();
            },

            _clearRow() {
                const row = this.field[this.currentRow];
                for (let i = 0; i < row.length; i++) {
                    row[i] = "";
                }
                this._update();
            },

            _fillRequiredChars() {
                if (this.difficulty > 0) {
                    for (let row of this.field) {
                        for (let i = 0; i < row.length; i++) {
                            if (this.guessedWord[i] === row[i]) {
                                this.field[this.currentRow][i] = row[i];
                            }
                        }
                    }
                }
            },

            _updateLetters() {
                this.absentLetters = [];
                this.misplacedLetters = [];
                this.correctLetters = [];

                for (let j = 0; j < this.currentRow; j++) {
                    for (let i = 0; i < this.field[j].length; i++) {
                        const c = this.field[j][i];
                        if (this.guessedWord[i] === c) {
                            if (this.correctLetters.indexOf(c) < 0) {
                                this.correctLetters.push(c);
                            }
                        } else if (this.guessedWord.indexOf(c) >= 0) {
                            if (this.misplacedLetters.indexOf(c) < 0) {
                                this.misplacedLetters.push(c);
                            }
                        } else {
                            if (this.absentLetters.indexOf(c) < 0) {
                                this.absentLetters.push(c);
                            }
                        }
                    }
                }
            },

            _updateStatus() {
                this._iterate((c, j, i) => {
                    if (j >= this.currentRow) {
                        this.status[j][i] = kStatusUnknown;
                    } else if (this.guessedWord[i] === c) {
                        this.status[j][i] = kStatusCorrect;
                    } else if (this.guessedWord.indexOf(c) >= 0) {
                        this.status[j][i] = kStatusMisplaced;
                    } else {
                        this.status[j][i] = kStatusAbsent;
                    }
                });
            }
        }
    }

    /* src\Cell.svelte generated by Svelte v3.46.2 */

    const file$b = "src\\Cell.svelte";

    function create_fragment$b(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let div2_style_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*value*/ ctx[0]);
    			add_location(div0, file$b, 13, 8, 497);
    			attr_dev(div1, "class", "inner svelte-15jw40x");
    			toggle_class(div1, "absent", /*status*/ ctx[2] === kStatusAbsent);
    			toggle_class(div1, "misplaced", /*status*/ ctx[2] === kStatusMisplaced);
    			toggle_class(div1, "correct", /*status*/ ctx[2] === kStatusCorrect);
    			add_location(div1, file$b, 9, 4, 308);
    			attr_dev(div2, "class", "cell svelte-15jw40x");
    			attr_dev(div2, "style", div2_style_value = `width:${/*size*/ ctx[1]}px; height:${/*size*/ ctx[1]}px; font-size:${/*size*/ ctx[1] * 0.75}px`);
    			add_location(div2, file$b, 8, 0, 214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);

    			if (dirty & /*status, kStatusAbsent*/ 4) {
    				toggle_class(div1, "absent", /*status*/ ctx[2] === kStatusAbsent);
    			}

    			if (dirty & /*status, kStatusMisplaced*/ 4) {
    				toggle_class(div1, "misplaced", /*status*/ ctx[2] === kStatusMisplaced);
    			}

    			if (dirty & /*status, kStatusCorrect*/ 4) {
    				toggle_class(div1, "correct", /*status*/ ctx[2] === kStatusCorrect);
    			}

    			if (dirty & /*size*/ 2 && div2_style_value !== (div2_style_value = `width:${/*size*/ ctx[1]}px; height:${/*size*/ ctx[1]}px; font-size:${/*size*/ ctx[1] * 0.75}px`)) {
    				attr_dev(div2, "style", div2_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cell', slots, []);
    	let { value = "" } = $$props;
    	let { size = 0 } = $$props;
    	let { status = kStatusUnknown } = $$props;
    	const writable_props = ['value', 'size', 'status'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cell> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    		if ('status' in $$props) $$invalidate(2, status = $$props.status);
    	};

    	$$self.$capture_state = () => ({
    		kStatusAbsent,
    		kStatusCorrect,
    		kStatusMisplaced,
    		kStatusUnknown,
    		value,
    		size,
    		status
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    		if ('status' in $$props) $$invalidate(2, status = $$props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, size, status];
    }

    class Cell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { value: 0, size: 1, status: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cell",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get value() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Row.svelte generated by Svelte v3.46.2 */
    const file$a = "src\\Row.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (11:4) {#each value as cell, i}
    function create_each_block$4(ctx) {
    	let cell;
    	let current;

    	cell = new Cell({
    			props: {
    				value: /*cell*/ ctx[4],
    				size: /*size*/ ctx[2],
    				status: /*model*/ ctx[3].status[/*index*/ ctx[1]][/*i*/ ctx[6]]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cell, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cell_changes = {};
    			if (dirty & /*value*/ 1) cell_changes.value = /*cell*/ ctx[4];
    			if (dirty & /*size*/ 4) cell_changes.size = /*size*/ ctx[2];
    			if (dirty & /*model, index*/ 10) cell_changes.status = /*model*/ ctx[3].status[/*index*/ ctx[1]][/*i*/ ctx[6]];
    			cell.$set(cell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(11:4) {#each value as cell, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let div_style_value;
    	let current;
    	let each_value = /*value*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "row svelte-wtyy92");
    			attr_dev(div, "style", div_style_value = `height:${/*size*/ ctx[2]}px`);
    			add_location(div, file$a, 9, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value, size, model, index*/ 15) {
    				each_value = /*value*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*size*/ 4 && div_style_value !== (div_style_value = `height:${/*size*/ ctx[2]}px`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, []);
    	let { value = [] } = $$props;
    	let { index = 0 } = $$props;
    	let { size = 0 } = $$props;
    	let { model = {} } = $$props;
    	const writable_props = ['value', 'index', 'size', 'model'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('model' in $$props) $$invalidate(3, model = $$props.model);
    	};

    	$$self.$capture_state = () => ({ Cell, value, index, size, model });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('model' in $$props) $$invalidate(3, model = $$props.model);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, index, size, model];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { value: 0, index: 1, size: 2, model: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get value() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get model() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set model(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Field.svelte generated by Svelte v3.46.2 */
    const file$9 = "src\\Field.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (12:4) {#each model.field as row, i}
    function create_each_block$3(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				value: /*row*/ ctx[5],
    				index: /*i*/ ctx[7],
    				size: /*cellSize*/ ctx[3],
    				model: /*model*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*model*/ 1) row_changes.value = /*row*/ ctx[5];
    			if (dirty & /*cellSize*/ 8) row_changes.size = /*cellSize*/ ctx[3];
    			if (dirty & /*model*/ 1) row_changes.model = /*model*/ ctx[0];
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(12:4) {#each model.field as row, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div0;
    	let div0_resize_listener;
    	let t0;
    	let div1;
    	let t1_value = /*model*/ ctx[0].guessedWord + "";
    	let t1;
    	let current;
    	let each_value = /*model*/ ctx[0].field;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "field svelte-16m9ylz");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[4].call(div0));
    			add_location(div0, file$9, 10, 0, 221);
    			add_location(div1, file$9, 15, 0, 418);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[4].bind(div0));
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*model, cellSize*/ 9) {
    				each_value = /*model*/ ctx[0].field;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*model*/ 1) && t1_value !== (t1_value = /*model*/ ctx[0].guessedWord + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			div0_resize_listener();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let cellSize;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Field', slots, []);
    	let { model = {} } = $$props;
    	let width = 0, height = 0;
    	const writable_props = ['model'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Field> was created with unknown prop '${key}'`);
    	});

    	function div0_elementresize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate(1, width);
    		$$invalidate(2, height);
    	}

    	$$self.$$set = $$props => {
    		if ('model' in $$props) $$invalidate(0, model = $$props.model);
    	};

    	$$self.$capture_state = () => ({ Row, model, width, height, cellSize });

    	$$self.$inject_state = $$props => {
    		if ('model' in $$props) $$invalidate(0, model = $$props.model);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('cellSize' in $$props) $$invalidate(3, cellSize = $$props.cellSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width, model, height*/ 7) {
    			$$invalidate(3, cellSize = Math.min(0.95 * width / model.field[0].length, height / model.field.length));
    		}
    	};

    	return [model, width, height, cellSize, div0_elementresize_handler];
    }

    class Field extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { model: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Field",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get model() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set model(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Keyboard.svelte generated by Svelte v3.46.2 */
    const file$8 = "src\\Keyboard.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (19:12) {#each row as key}
    function create_each_block_1$1(ctx) {
    	let button;
    	let t_value = /*key*/ ctx[10] + "";
    	let t;
    	let button_data_key_value;
    	let button_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "key svelte-td18s3");
    			attr_dev(button, "data-key", button_data_key_value = /*key*/ ctx[10]);
    			attr_dev(button, "style", button_style_value = `width:${/*keyWidth*/ ctx[3]}px;font-size:${/*keyWidth*/ ctx[3] * 0.5}px`);
    			toggle_class(button, "absent", /*model*/ ctx[0].absentLetters.indexOf(/*key*/ ctx[10]) >= 0);
    			toggle_class(button, "misplaced", /*model*/ ctx[0].misplacedLetters.indexOf(/*key*/ ctx[10]) >= 0);
    			toggle_class(button, "correct", /*model*/ ctx[0].correctLetters.indexOf(/*key*/ ctx[10]) >= 0);
    			add_location(button, file$8, 19, 16, 613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*model*/ 1 && t_value !== (t_value = /*key*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*model*/ 1 && button_data_key_value !== (button_data_key_value = /*key*/ ctx[10])) {
    				attr_dev(button, "data-key", button_data_key_value);
    			}

    			if (dirty & /*keyWidth*/ 8 && button_style_value !== (button_style_value = `width:${/*keyWidth*/ ctx[3]}px;font-size:${/*keyWidth*/ ctx[3] * 0.5}px`)) {
    				attr_dev(button, "style", button_style_value);
    			}

    			if (dirty & /*model*/ 1) {
    				toggle_class(button, "absent", /*model*/ ctx[0].absentLetters.indexOf(/*key*/ ctx[10]) >= 0);
    			}

    			if (dirty & /*model*/ 1) {
    				toggle_class(button, "misplaced", /*model*/ ctx[0].misplacedLetters.indexOf(/*key*/ ctx[10]) >= 0);
    			}

    			if (dirty & /*model*/ 1) {
    				toggle_class(button, "correct", /*model*/ ctx[0].correctLetters.indexOf(/*key*/ ctx[10]) >= 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(19:12) {#each row as key}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#each model.keyboard.split("|") as row}
    function create_each_block$2(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*row*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "row svelte-td18s3");
    			add_location(div, file$8, 17, 8, 546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*model, keyWidth, handleClick*/ 25) {
    				each_value_1 = /*row*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:4) {#each model.keyboard.split(\\\"|\\\") as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let div_resize_listener;
    	let each_value = /*model*/ ctx[0].keyboard.split("|");
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "keyboard svelte-td18s3");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[5].call(div));
    			add_location(div, file$8, 15, 0, 416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[5].bind(div));
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*model, keyWidth, handleClick*/ 25) {
    				each_value = /*model*/ ctx[0].keyboard.split("|");
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let keyWidth;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyboard', slots, []);
    	const dispatch = createEventDispatcher();
    	let { model = {} } = $$props;
    	let width = 0, height = 0;

    	function handleClick(e) {
    		dispatch('click', { key: e.target.dataset.key });
    	}

    	const writable_props = ['model'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	function div_elementresize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate(1, width);
    		$$invalidate(2, height);
    	}

    	$$self.$$set = $$props => {
    		if ('model' in $$props) $$invalidate(0, model = $$props.model);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		model,
    		width,
    		height,
    		handleClick,
    		keyWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('model' in $$props) $$invalidate(0, model = $$props.model);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('keyWidth' in $$props) $$invalidate(3, keyWidth = $$props.keyWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width, model, height*/ 7) {
    			$$invalidate(3, keyWidth = Math.min(width / model.keyboard.split("|").reduce((p, row) => Math.max(p, row.length), 0), height / 3 * 0.75));
    		}
    	};

    	return [model, width, height, keyWidth, handleClick, div_elementresize_handler];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { model: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get model() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set model(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Button.svelte generated by Svelte v3.46.2 */

    const file$7 = "src\\Button.svelte";

    function create_fragment$7(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-wwdwef");
    			add_location(button, file$7, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Header.svelte generated by Svelte v3.46.2 */
    const file$6 = "src\\Header.svelte";

    // (18:4) <Button on:click={handleInfoClick}>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("ⓘ");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(18:4) <Button on:click={handleInfoClick}>",
    		ctx
    	});

    	return block;
    }

    // (20:4) <Button on:click={handleSettingsClick}>
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("⚙");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(20:4) <Button on:click={handleSettingsClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let button0;
    	let t0;
    	let div0;
    	let t1_value = /*locale*/ ctx[0].title + "";
    	let t1;
    	let sup;
    	let t2;
    	let t3;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*handleInfoClick*/ ctx[2]);

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*handleSettingsClick*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			sup = element("sup");
    			t2 = text(/*version*/ ctx[1]);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(sup, "class", "svelte-1obrgtj");
    			add_location(sup, file$6, 18, 37, 500);
    			attr_dev(div0, "class", "title svelte-1obrgtj");
    			add_location(div0, file$6, 18, 4, 467);
    			attr_dev(div1, "class", "header svelte-1obrgtj");
    			add_location(div1, file$6, 16, 0, 384);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(button0, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, sup);
    			append_dev(sup, t2);
    			append_dev(div1, t3);
    			mount_component(button1, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			if ((!current || dirty & /*locale*/ 1) && t1_value !== (t1_value = /*locale*/ ctx[0].title + "")) set_data_dev(t1, t1_value);
    			if (!current || dirty & /*version*/ 2) set_data_dev(t2, /*version*/ ctx[1]);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $model;
    	validate_store(model, 'model');
    	component_subscribe($$self, model, $$value => $$invalidate(4, $model = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { locale = {} } = $$props;
    	let { version } = $$props;

    	function handleInfoClick() {
    		model.set($model.setScreen(kScreenHelp));
    	}

    	function handleSettingsClick() {
    		model.set($model.setScreen(kScreenSettings));
    	}

    	const writable_props = ['locale', 'version'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    		if ('version' in $$props) $$invalidate(1, version = $$props.version);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		kScreenHelp,
    		kScreenSettings,
    		model,
    		locale,
    		version,
    		handleInfoClick,
    		handleSettingsClick,
    		$model
    	});

    	$$self.$inject_state = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    		if ('version' in $$props) $$invalidate(1, version = $$props.version);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [locale, version, handleInfoClick, handleSettingsClick];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { locale: 0, version: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*version*/ ctx[1] === undefined && !('version' in props)) {
    			console.warn("<Header> was created without expected prop 'version'");
    		}
    	}

    	get locale() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set locale(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get version() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Game.svelte generated by Svelte v3.46.2 */
    const file$5 = "src\\Game.svelte";

    // (15:0) {#if $model.screen === kScreenGame}
    function create_if_block$3(ctx) {
    	let div;
    	let header;
    	let t0;
    	let field;
    	let t1;
    	let keyboard;
    	let current;

    	header = new Header({
    			props: {
    				locale: /*locale*/ ctx[0],
    				version: /*version*/ ctx[1]
    			},
    			$$inline: true
    		});

    	field = new Field({
    			props: { model: /*$model*/ ctx[2] },
    			$$inline: true
    		});

    	keyboard = new Keyboard({
    			props: { model: /*$model*/ ctx[2] },
    			$$inline: true
    		});

    	keyboard.$on("click", /*handleKeyClick*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(field.$$.fragment);
    			t1 = space();
    			create_component(keyboard.$$.fragment);
    			attr_dev(div, "class", "game svelte-clttrj");
    			add_location(div, file$5, 15, 4, 386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(header, div, null);
    			append_dev(div, t0);
    			mount_component(field, div, null);
    			append_dev(div, t1);
    			mount_component(keyboard, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};
    			if (dirty & /*locale*/ 1) header_changes.locale = /*locale*/ ctx[0];
    			if (dirty & /*version*/ 2) header_changes.version = /*version*/ ctx[1];
    			header.$set(header_changes);
    			const field_changes = {};
    			if (dirty & /*$model*/ 4) field_changes.model = /*$model*/ ctx[2];
    			field.$set(field_changes);
    			const keyboard_changes = {};
    			if (dirty & /*$model*/ 4) keyboard_changes.model = /*$model*/ ctx[2];
    			keyboard.$set(keyboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(field.$$.fragment, local);
    			transition_in(keyboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(field.$$.fragment, local);
    			transition_out(keyboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(header);
    			destroy_component(field);
    			destroy_component(keyboard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(15:0) {#if $model.screen === kScreenGame}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$model*/ ctx[2].screen === kScreenGame && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$model*/ ctx[2].screen === kScreenGame) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$model*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $model;
    	validate_store(model, 'model');
    	component_subscribe($$self, model, $$value => $$invalidate(2, $model = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
    	let { locale } = $$props;
    	let { version } = $$props;

    	function handleKeyClick(e) {
    		model.set($model.insert(e.detail.key));
    	}

    	const writable_props = ['locale', 'version'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    		if ('version' in $$props) $$invalidate(1, version = $$props.version);
    	};

    	$$self.$capture_state = () => ({
    		Field,
    		Keyboard,
    		kScreenGame,
    		model,
    		Header,
    		locale,
    		version,
    		handleKeyClick,
    		$model
    	});

    	$$self.$inject_state = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    		if ('version' in $$props) $$invalidate(1, version = $$props.version);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [locale, version, $model, handleKeyClick];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { locale: 0, version: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*locale*/ ctx[0] === undefined && !('locale' in props)) {
    			console.warn("<Game> was created without expected prop 'locale'");
    		}

    		if (/*version*/ ctx[1] === undefined && !('version' in props)) {
    			console.warn("<Game> was created without expected prop 'version'");
    		}
    	}

    	get locale() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set locale(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get version() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var locale = {
        keyboard: `йцукенгшщзх|фывапролджэ|${kBsp}ячсмитьбю${kRet}`,
        title: "Еще одно слово",
        victory: "Победа",
        averageTries: "Среднее количество попыток: ",
        defeat: "Неудача",
        guessedWord: "Загаданное слово:",
        nextGame: "Еще одно слово?",
        kMsgWordNotInDictionary: "Слово «$0» не найдено в словаре.",
        kMsgLetterMissed: "Буква «$0» должна быть использована.",
        kMsgInsufficientLetter: "Буквы «$0» не может быть в слове.",
        kMsgWrongLetterPosition: "Буква «$0» стоит на неправильном месте.",
        play: "Играть",
        ok: "OK",
        help: [
            "<p>Цель игры: угадать слово за 6 или менее попыток.</p>",
            "<p>После очередной попытки ввода слова его буквы будут раскрашены по следующим правилам:</p>",
            "<ul>",
            "<li><span class='misplaced'>Желтым</span> &mdash; если эта буква присутствует в загаданном слове;</li>",
            "<li><span class='correct'>Зеленым</span> &mdash; если эта буква присутствует и стоит на верной позиции.</li>",
            "</ul>",
            "<p>Используя эти подсказки, попробуйте угадать слово!</p>"
        ],
        dictionary: {
            5: [
                "время",
                "жизнь",
                "слово",
                "место",
                "конец",
                "часть",
                "город",
                "земля",
                "право",
                "дверь",
                "образ",
                "закон",
                "война",
                "голос",
                "книга",
                "число",
                "народ",
                "форма",
                "связь",
                "улица",
                "вечер",
                "мысль",
                "месяц",
                "школа",
                "театр",
                "рубль",
                "смысл",
                "орган",
                "рынок",
                "семья",
                "центр",
                "ответ",
                "автор",
                "стена",
                "совет",
                "глава",
                "наука",
                "плечо",
                "точка",
                "палец",
                "номер",
                "метод",
                "фильм",
                "гость",
                "кровь",
                "район",
                "армия",
                "класс",
                "герой",
                "спина",
                "сцена",
                "берег",
                "фирма",
                "завод",
                "песня",
                "роман",
                "стихи",
                "повод",
                "успех",
                "выход",
                "текст",
                "пункт",
                "линия",
                "среда",
                "волос",
                "ветер",
                "огонь",
                "грудь",
                "страх",
                "сумма",
                "сфера",
                "мужик",
                "немец",
                "выбор",
                "масса",
                "слава",
                "кухня",
                "отдел",
                "товар",
                "актер",
                "слеза",
                "вывод",
                "норма",
                "рамка",
                "прием",
                "режим",
                "целое",
                "вирус",
                "поиск",
                "налог",
                "доход",
                "карта",
                "акция",
                "сосед",
                "фраза",
                "толпа",
                "схема",
                "волна",
                "птица",
                "запах",
                "водка",
                "поезд",
                "адрес",
                "лидер",
                "стиль",
                "весна",
                "эпоха",
                "запад",
                "тайна",
                "трава",
                "фронт",
                "музей",
                "князь",
                "сутки",
                "судья",
                "крыша",
                "поток",
                "честь",
                "еврей",
                "сотня",
                "дождь",
                "труба",
                "осень",
                "пьеса",
                "черта",
                "кусок",
                "билет",
                "масло",
                "экран",
                "канал",
                "вагон",
                "дурак",
                "сезон",
                "запас",
                "длина",
                "крыло",
                "округ",
                "доска",
                "полет",
                "пакет",
                "живот",
                "смена",
                "порог",
                "буква",
                "лодка",
                "серия",
                "шутка",
                "кулак",
                "нефть",
                "цифра",
                "сапог",
                "жилье",
                "мешок",
                "отказ",
                "замок",
                "диван",
                "добро",
                "покой",
                "кость",
                "спорт",
                "майор",
                "отдых",
                "ручка",
                "мечта",
                "сюжет",
                "рубеж",
                "крест",
                "взрыв",
                "почва",
                "заказ",
                "штука",
                "сумка",
                "хвост",
                "песок",
                "озеро",
                "строй",
                "дочка",
                "танец",
                "набор",
                "горло",
                "плата",
                "кошка",
                "пятно",
                "ткань",
                "визит",
                "океан",
                "пауза",
                "ствол",
                "тепло",
                "радио",
                "зверь",
                "нация",
                "банка",
                "метро",
                "отчет",
                "обмен",
                "тоска",
                "забор",
                "мороз",
                "марка",
                "грязь",
                "спрос",
                "мотор",
                "север",
                "склад",
                "мотив",
                "арест",
                "отряд",
                "нужда",
                "собор",
                "салон",
                "капля",
                "пожар",
                "холод",
                "тетка",
                "обида",
                "вклад",
                "гонка",
                "рукав",
                "туман",
                "шофер",
                "атака",
                "игрок",
                "тонна",
                "вождь",
                "орден",
                "юноша",
                "бабка",
                "вызов",
                "полка",
                "бровь",
                "удача",
                "бытие",
                "шапка",
                "ложка",
                "белок",
                "голод",
                "охота",
                "домик",
                "ветка",
                "башня",
                "тариф",
                "агент",
                "гений",
                "сахар",
                "благо",
                "смесь",
                "разум",
                "плита",
                "брюки",
                "мышца",
                "посол",
                "пачка",
                "шоссе",
                "икона",
                "халат",
                "идеал",
                "лента",
                "бомба",
                "штамм",
                "ущерб",
                "архив",
                "сырье",
                "штаны",
                "поход",
                "морда",
                "проза",
                "маска",
                "опера",
                "шляпа",
                "белье",
                "ведро",
                "лампа",
                "малыш",
                "облик",
                "копия",
                "уголь",
                "устав",
                "судно",
                "чашка",
                "элита",
                "ветвь",
                "почта",
                "палка",
                "актив",
                "столб",
                "ангел",
                "штраф",
                "отель",
                "мышка",
                "ножка",
                "стать",
                "свеча",
                "блюдо",
                "грань",
                "скала",
                "FALSE",
                "такси",
                "зерно",
                "сосна",
                "форум",
                "блеск",
                "папка",
                "степь",
                "ковер",
                "пламя",
                "треть",
                "певец",
                "ружье",
                "речка",
                "финал",
                "недра",
                "девка",
                "знамя",
                "рюмка",
                "исход",
                "общее",
                "звено",
                "грипп",
                "печка",
                "шепот",
                "пилот",
                "плоть",
                "самец",
                "череп",
                "бочка",
                "гараж",
                "сосуд",
                "поэма",
                "склон",
                "лавка",
                "бокал",
                "кисть",
                "идиот",
                "койка",
                "якорь",
                "дрова",
                "ворот",
                "опора",
                "учеба",
                "топор",
                "физик",
                "барон",
                "барак",
                "кукла",
                "жених",
                "носок",
                "обувь",
                "намек",
                "котел",
                "принц",
                "пушка",
                "бедро",
                "порыв",
                "сетка",
                "сарай",
                "опрос",
                "старт",
                "шкура",
                "драка",
                "проба",
                "казак",
                "мусор",
                "моряк",
                "самка",
                "туфля",
                "химия",
                "мадам",
                "племя",
                "кубок",
                "ягода",
                "битва",
                "монах",
                "грамм",
                "дырка",
                "побег",
                "базар",
                "драма",
                "отбор",
                "спирт",
                "кузов",
                "ванна",
                "канон",
                "рыбак",
                "ребро",
                "фрукт",
                "вдова",
                "балет",
                "весть",
                "казнь",
                "навык",
                "пение",
                "ручей",
                "взвод",
                "касса",
                "щенок",
                "вздох",
                "юрист",
                "шахта",
                "букет",
                "тираж",
                "шпион",
                "жилец",
                "тезис",
                "залог",
                "струя",
                "очерк",
                "буфет",
                "жажда",
                "сдача",
                "овощи",
                "нитка",
                "рояль",
                "пацан",
                "суета",
                "козел",
                "наряд",
                "тайга",
                "петля",
                "пласт",
                "обман",
                "шарик",
                "рычаг",
                "злоба",
                "песнь",
                "стадо",
                "глина",
                "выезд",
                "закат",
                "висок",
                "обзор",
                "завет",
                "искра",
                "погон",
                "взнос",
                "слуга",
                "крыса",
                "культ",
                "сынок",
                "довод",
                "спуск",
                "чайка",
                "грунт",
                "обыск",
                "заряд",
                "купол",
                "отзыв",
                "позор",
                "вопль",
                "катер",
                "цыган",
                "алмаз",
                "минус",
                "обряд",
                "поляк",
                "тупик",
                "тропа",
                "рельс",
                "дилер",
                "ферма",
                "горка",
                "пирог",
                "сталь",
                "табак",
                "почка",
                "тварь",
                "залив",
                "испуг",
                "аллея",
                "вилка",
                "петух",
                "фокус",
                "показ",
                "овраг",
                "гроза",
                "полюс",
                "русло",
                "будка",
                "олень",
                "рубка",
                "рыбка",
                "трусы",
                "салат",
                "банда",
                "борец",
                "обрыв",
                "хохот",
                "комар",
                "майка",
                "парус",
                "перец",
                "пират",
                "стенд",
                "ислам",
                "упрек",
                "хутор",
                "биржа",
                "исток",
                "налет",
                "фасад",
                "истец",
                "пытка",
                "турок",
                "этика",
                "виски",
                "обком",
                "влага",
                "новое",
                "сеанс",
                "мэрия",
                "палач",
                "клоун",
                "треск",
                "башка",
                "сплав",
                "ссора",
                "медик",
                "насос",
                "скука",
                "шкала",
                "арена",
                "имидж",
                "ласка",
                "титул",
                "киоск",
                "парта",
                "повар",
                "затея",
                "парад",
                "пучок",
                "газон",
                "пятка",
                "крона",
                "синяк",
                "рывок",
                "взлет",
                "пепел",
                "порок",
                "седло",
                "штурм",
                "проем",
                "дрожь",
                "каюта",
                "кишка",
                "купец",
                "сдвиг",
                "штора",
                "бремя",
                "фюрер",
                "нищий",
                "пафос",
                "кепка",
                "миска",
                "багаж",
                "конек",
                "манеж",
                "месть",
                "чулок",
                "дрянь",
                "кумир",
                "садик",
                "свист",
                "азарт",
                "геном",
                "гудок",
                "квота",
                "пасть",
                "лимон",
                "стопа",
                "белка",
                "обход",
                "ролик",
                "слюна",
                "оклад",
                "бетон",
                "камин",
                "пульт",
                "гамма",
                "мерка",
                "афиша",
                "вахта",
                "груда",
                "родня",
                "донос",
                "особа",
                "шорох",
                "штамп",
                "бланк",
                "брюхо",
                "груша",
                "демон",
                "магия",
                "скрип",
                "талия",
                "тесто",
                "вышка",
                "ларек",
                "сквер",
                "вилла",
                "лапка",
                "кучка",
                "пчела",
                "скула",
                "абзац",
                "пасха",
                "франк",
                "бугор",
                "напор",
                "казна",
                "копье",
                "балка",
                "весло",
                "зачет",
                "кубик",
                "червь",
                "щетка",
                "досуг",
                "вихрь",
                "чутье",
                "венец",
                "косяк",
                "нюанс",
                "шашка",
                "чудак",
                "вылет",
                "глубь",
                "корма",
                "пульс",
                "шишка",
                "акула",
                "отсек",
                "приют",
                "свита",
                "кража",
                "лилия",
                "факел",
                "шланг",
                "арбуз",
                "венок",
                "диета",
                "корка",
                "дуэль",
                "канат",
                "рубин",
                "баран",
                "холст",
                "колея",
                "мафия",
                "рация",
                "будни",
                "износ",
                "комок",
                "робот",
                "грант",
                "аллах",
                "глыба",
                "изгиб",
                "рифма",
                "фланг",
                "эскиз",
                "бухта",
                "манер",
                "нутро",
                "тачка",
                "финиш",
                "химик",
                "аборт",
                "вальс",
                "сокол",
                "черед",
                "чукча",
                "броня",
                "возня",
                "каска",
                "салют",
                "баржа",
                "говно",
                "дебют",
                "девиз",
                "макет",
                "опека",
                "подол",
                "почет",
                "толща",
                "вывоз",
                "рента",
                "церка",
                "каток",
                "отрыв",
                "уклон",
                "шприц",
                "веник",
                "жулик",
                "кофта",
                "недуг",
                "особь",
                "отбой",
                "тесть",
                "богач",
                "мячик",
                "навоз",
                "ощупь",
                "сироп",
                "трест",
                "будда",
                "видео",
                "вишня",
                "донор",
                "дымок",
                "капот",
                "смола",
                "сыщик",
                "барин",
                "выкуп",
                "заход",
                "отвод",
                "сопка",
                "банан",
                "житие",
                "зенит",
                "лунка",
                "матка",
                "посев",
                "устье",
                "канун",
                "малое",
                "навес",
                "парик",
                "пресс",
                "аванс",
                "жилка",
                "ордер",
                "откос",
                "сабля",
                "ссуда",
                "уклад",
                "шторм",
                "пешка",
                "отход",
                "тракт",
                "узник",
                "шасси",
                "дробь",
                "крупа",
                "мираж",
                "полис",
                "улика",
                "этнос",
                "губка",
                "забой",
                "метла",
                "руины",
                "талон",
                "лоток",
                "сауна",
                "секта",
                "сенат",
                "мачта",
                "порох",
                "прядь",
                "тахта",
                "шакал",
                "горох",
                "завал",
                "лимит",
                "раунд",
                "шрифт",
                "дымка",
                "заезд",
                "паста",
                "страж",
                "сукно",
                "филин",
                "гетто",
                "молот",
                "озноб",
                "синод",
                "топик",
                "топот",
                "бренд",
                "гладь",
                "графа",
                "греза",
                "загар",
                "кабак",
                "фотка",
                "хруст",
                "чехол",
                "байка",
                "валун",
                "взмах",
                "выпад",
                "иудей",
                "леший",
                "линза",
                "нажим",
                "ничья",
                "уксус",
                "белый",
                "брань",
                "брэнд",
                "бычок",
                "вожак",
                "кефир",
                "кивок",
                "мойка",
                "наезд",
                "носик",
                "порча",
                "хорек",
                "штрих",
                "атлас",
                "бутик",
                "виток",
                "лавра",
                "мятеж",
                "сосок",
                "трата",
                "булат",
                "нотка",
                "созыв",
                "устой",
                "ворох",
                "вычет",
                "дозор",
                "мякиш",
                "рыжик",
                "фишка",
                "шейка",
                "шпага",
                "кудри",
                "лопух",
                "отчим",
                "разок",
                "слива",
                "шорты",
                "щепка",
                "яичко",
                "ловля",
                "мытье",
                "полог",
                "помин",
                "пудра",
                "смута",
                "акциз",
                "батон",
                "ворон",
                "врата",
                "галка",
                "грива",
                "денек",
                "дубль",
                "запой",
                "кабан",
                "камыш",
                "кочка",
                "лакей",
                "наган",
                "немка",
                "пурга",
                "флора",
                "чугун",
                "шалаш",
                "шаман",
                "шатер",
                "ширма",
                "шпана",
                "альфа",
                "вздор",
                "гайка",
                "гряда",
                "комод",
                "метан",
                "милая",
                "осина",
                "отпор",
                "резон",
                "смета",
                "счеты",
                "тенор",
                "топка",
                "шайка",
                "гусар",
                "досье",
                "курок",
                "рожок",
                "выдох",
                "древо",
                "жилет",
                "лицей",
                "масть",
                "охват",
                "питье",
                "тыква",
                "фанат",
                "чрево",
                "амбар",
                "вотум",
                "детка",
                "мушка",
                "ореол",
                "санки",
                "титан",
                "фауна",
                "часик",
                "алкаш",
                "берет",
                "булка",
                "варяг",
                "конус",
                "лазер",
                "лапша",
                "сапер",
                "танго",
                "хобби",
                "шайба",
                "келья",
                "сушка",
                "тиран",
                "бутон",
                "догма",
                "запор",
                "обвал",
                "окрик",
                "смотр",
                "сотка",
                "укроп",
                "флюид",
                "шлюха",
                "главк",
                "гольф",
                "днище",
                "ересь",
                "томик",
                "тумба",
                "умник",
                "фужер",
                "иврит",
                "казах",
                "лютик",
                "мания",
                "отрок",
                "паром",
                "пинок",
                "фигня",
                "хмель",
                "чужак",
                "шпиль",
                "эмаль",
                "блоха",
                "вырез",
                "глушь",
                "горец",
                "житье",
                "калий",
                "краса",
                "ладья",
                "мамка",
                "ножик",
                "норка",
                "оксид",
                "рулон",
                "сучок",
                "тонус",
                "уступ",
                "эгида",
                "вожжа",
                "кучер",
                "накал",
                "обрез",
                "пайка",
                "потоп",
                "торец",
                "узбек",
                "шубка",
                "ярлык",
                "буран",
                "волхв",
                "газик",
                "клерк",
                "кроха",
                "ослик",
                "отвар",
                "отлет",
                "пашня",
                "пенек",
                "пупок",
                "чешуя",
                "вынос",
                "декан",
                "зажим",
                "зазор",
                "засов",
                "леска",
                "ляжка",
                "мазут",
                "масон",
                "молва",
                "мумия",
                "обруч",
                "отлив",
                "плеть",
                "посох",
                "рознь",
                "склеп",
                "тезка",
                "томат",
                "тулуп",
                "шпала",
                "буфер",
                "вогул",
                "декор",
                "колос",
                "падла",
                "полив",
                "пятак",
                "рвота",
                "сброс",
                "сифон",
                "спазм",
                "табор",
                "телец",
                "тюбик",
                "хвала",
                "шитье",
                "астра",
                "бачок",
                "варка",
                "зайка",
                "зелье",
                "лямка",
                "отток",
                "скоба",
                "ареал",
                "аудит",
                "базис",
                "дамба",
                "делец",
                "егерь",
                "жучок",
                "завуч",
                "зубец",
                "метка",
                "набег",
                "ножны",
                "опись",
                "ртуть",
                "чувак",
                "аршин",
                "басня",
                "говор",
                "дебри",
                "десна",
                "жердь",
                "лотос",
                "осада",
                "отвал",
                "перст",
                "спица",
                "столп",
                "такса",
                "транс",
                "убыль",
                "ангар",
                "афера",
                "вираж",
                "гонец",
                "индус",
                "казус",
                "кореш",
                "лиана",
                "окунь",
                "рубец",
                "седан",
                "траур",
                "фасон",
                "фляга",
                "челка",
                "шлейф",
                "шмель",
                "щечка",
                "юнкер",
                "бидон",
                "бойня",
                "валик",
                "жетон",
                "загон",
                "кулик",
                "плеск",
                "тембр",
                "турне",
                "хобот",
                "чулан",
                "шельф",
                "шквал",
                "бирюк",
                "каста",
                "котик",
                "ликер",
                "оазис",
                "пижон",
                "пицца",
                "побои",
                "смерч",
                "стужа",
                "щиток",
                "бисер",
                "вояка",
                "годик",
                "жесть",
                "кадка",
                "короб",
                "латыш",
                "оплот",
                "панно",
                "песец",
                "посад",
                "прима",
                "рафик",
                "хиппи",
                "циник",
                "аркан",
                "дебил",
                "джинн",
                "дятел",
                "замер",
                "изыск",
                "колба",
                "кредо",
                "левша",
                "лесть",
                "локон",
                "ломка",
                "наказ",
                "покои",
                "понос",
                "родич",
                "совок",
                "тазик",
                "талиб",
                "тапка",
                "тушка",
                "хохол",
                "бочок",
                "гарем",
                "гниль",
                "изгой",
                "копна",
                "ладан",
                "литье",
                "пивко",
                "плато",
                "плаха",
                "пойма",
                "ранка",
                "резец",
                "сопли",
                "судак",
                "табло",
                "терем",
                "тоник",
                "шажок",
                "бубен",
                "гамак",
                "жабра",
                "кадет",
                "кулек",
                "кураж",
                "остов",
                "откат",
                "падеж",
                "пушок",
                "сучка",
                "тягач",
                "уазик",
                "угода",
                "фугас",
                "чурка",
                "адепт",
                "астма",
                "бронь",
                "вьюга",
                "задор",
                "кварц",
                "лесок",
                "мазок",
                "марля",
                "нарта",
                "пахан",
                "помет",
                "сонет",
                "табун",
                "телка",
                "хлыст",
                "абвер",
                "брешь",
                "гнида",
                "давка",
                "дрозд",
                "кадык",
                "кобра",
                "круиз",
                "кузен",
                "кушак",
                "кювет",
                "лихва",
                "маляр",
                "нахал",
                "пикет",
                "попка",
                "почин",
                "радар",
                "рокот",
                "румын",
                "рупор",
                "самбо",
                "сачок",
                "трель",
                "хакер",
                "слизь",
                "снедь",
                "фикус",
                "дупло",
                "кисет",
                "чернь",
                "кольт",
                "ясень",
                "бобер",
                "холуй",
                "дзюдо",
                "опала"
            ],
            6: [
                "работа",
                "вопрос",
                "страна",
                "случай",
                "голова",
                "деньги",
                "машина",
                "власть",
                "тысяча",
                "статья",
                "группа",
                "начало",
                "минута",
                "дорога",
                "любовь",
                "взгляд",
                "момент",
                "письмо",
                "помощь",
                "смерть",
                "задача",
                "партия",
                "сердце",
                "неделя",
                "газета",
                "основа",
                "данные",
                "мнение",
                "проект",
                "служба",
                "судьба",
                "состав",
                "период",
                "пример",
                "воздух",
                "борьба",
                "размер",
                "доллар",
                "музыка",
                "правда",
                "память",
                "дерево",
                "хозяин",
                "солнце",
                "способ",
                "журнал",
                "оценка",
                "регион",
                "анализ",
                "бумага",
                "модель",
                "старик",
                "ребята",
                "знание",
                "защита",
                "доктор",
                "солдат",
                "оружие",
                "парень",
                "зрение",
                "услуга",
                "бизнес",
                "собака",
                "камень",
                "здание",
                "бюджет",
                "победа",
                "звезда",
                "сестра",
                "карман",
                "войско",
                "офицер",
                "предел",
                "выборы",
                "ученый",
                "теория",
                "клетка",
                "расчет",
                "ошибка",
                "колено",
                "стекло",
                "высота",
                "трубка",
                "мастер",
                "подход",
                "ресурс",
                "улыбка",
                "артист",
                "фигура",
                "список",
                "усилие",
                "остров",
                "житель",
                "одежда",
                "кресло",
                "ладонь",
                "цветок",
                "январь",
                "фактор",
                "август",
                "охрана",
                "расход",
                "родина",
                "лагерь",
                "клиент",
                "беседа",
                "апрель",
                "кодекс",
                "костюм",
                "лошадь",
                "ученик",
                "приказ",
                "жертва",
                "восток",
                "польза",
                "звонок",
                "деталь",
                "тишина",
                "тюрьма",
                "книжка",
                "угроза",
                "стакан",
                "запись",
                "палата",
                "ноябрь",
                "потеря",
                "колесо",
                "камера",
                "оплата",
                "эффект",
                "доклад",
                "платье",
                "ремонт",
                "корень",
                "ракета",
                "выпуск",
                "корпус",
                "талант",
                "полоса",
                "дворец",
                "забота",
                "столик",
                "печать",
                "кольцо",
                "ворота",
                "дружба",
                "кредит",
                "металл",
                "молоко",
                "поэзия",
                "краска",
                "сигнал",
                "золото",
                "премия",
                "король",
                "чтение",
                "ставка",
                "статус",
                "сказка",
                "версия",
                "пенсия",
                "кризис",
                "яблоко",
                "сделка",
                "строка",
                "погода",
                "пресса",
                "вокзал",
                "гибель",
                "могила",
                "стенка",
                "логика",
                "термин",
                "прибор",
                "оборот",
                "секрет",
                "пальто",
                "порода",
                "мебель",
                "костер",
                "стадия",
                "звание",
                "раздел",
                "сектор",
                "учение",
                "символ",
                "привет",
                "добыча",
                "корова",
                "отпуск",
                "эпизод",
                "облако",
                "бандит",
                "куртка",
                "физика",
                "приход",
                "колхоз",
                "платок",
                "локоть",
                "жалоба",
                "мелочь",
                "умение",
                "лекция",
                "подвиг",
                "летчик",
                "одеяло",
                "диалог",
                "пиджак",
                "манера",
                "студия",
                "тренер",
                "коньяк",
                "юность",
                "замена",
                "приезд",
                "аспект",
                "туалет",
                "пленка",
                "экипаж",
                "ссылка",
                "убийца",
                "призыв",
                "натура",
                "доступ",
                "подвал",
                "космос",
                "курица",
                "девица",
                "кнопка",
                "фонарь",
                "трасса",
                "градус",
                "запрос",
                "кабина",
                "медаль",
                "уголок",
                "разрыв",
                "орудие",
                "эмоция",
                "борода",
                "критик",
                "посуда",
                "боевик",
                "супруг",
                "крышка",
                "платеж",
                "авария",
                "валюта",
                "стойка",
                "листок",
                "предок",
                "турнир",
                "льгота",
                "железо",
                "дверца",
                "огонек",
                "ремень",
                "балкон",
                "огород",
                "баланс",
                "юбилей",
                "кирпич",
                "аренда",
                "допрос",
                "футбол",
                "запрет",
                "спектр",
                "турист",
                "молния",
                "подача",
                "глазок",
                "провод",
                "кружка",
                "акцент",
                "ванная",
                "заявка",
                "обычай",
                "резерв",
                "диплом",
                "окошко",
                "шинель",
                "ноготь",
                "филиал",
                "болото",
                "лозунг",
                "патрон",
                "ширина",
                "снаряд",
                "зелень",
                "пейзаж",
                "гвоздь",
                "проход",
                "альбом",
                "святой",
                "снимок",
                "японец",
                "ерунда",
                "свинья",
                "родные",
                "аромат",
                "тряпка",
                "отмена",
                "провал",
                "разряд",
                "бревно",
                "климат",
                "синтез",
                "спинка",
                "график",
                "урожай",
                "барьер",
                "захват",
                "надзор",
                "гитара",
                "матрос",
                "развод",
                "хирург",
                "бензин",
                "миссия",
                "грохот",
                "выдача",
                "взятка",
                "община",
                "цитата",
                "чайник",
                "пророк",
                "пробка",
                "рубаха",
                "сессия",
                "убыток",
                "ярость",
                "прыжок",
                "тройка",
                "гнездо",
                "ирония",
                "стрела",
                "выгода",
                "дизайн",
                "рецепт",
                "китаец",
                "мораль",
                "палуба",
                "береза",
                "пещера",
                "спичка",
                "плакат",
                "кружок",
                "кончик",
                "поляна",
                "легкое",
                "травма",
                "лопата",
                "пустяк",
                "джинсы",
                "печаль",
                "дьявол",
                "отходы",
                "печень",
                "долина",
                "огурец",
                "рыцарь",
                "стихия",
                "горечь",
                "ограда",
                "толчок",
                "фонтан",
                "индекс",
                "маршал",
                "телега",
                "крючок",
                "деяние",
                "монета",
                "станок",
                "злость",
                "кошмар",
                "распад",
                "рюкзак",
                "жилище",
                "пленум",
                "чертеж",
                "эшелон",
                "порция",
                "секция",
                "старец",
                "шерсть",
                "размах",
                "труппа",
                "уплата",
                "фашист",
                "дракон",
                "импорт",
                "панель",
                "досада",
                "модуль",
                "певица",
                "внучка",
                "митинг",
                "горшок",
                "каблук",
                "осмотр",
                "паника",
                "почерк",
                "рекорд",
                "мундир",
                "пузырь",
                "статуя",
                "бездна",
                "связка",
                "аналог",
                "знаток",
                "творец",
                "глоток",
                "гонщик",
                "проезд",
                "утрата",
                "верста",
                "стража",
                "кличка",
                "формат",
                "контур",
                "маневр",
                "разрез",
                "теракт",
                "аптека",
                "кулиса",
                "орбита",
                "свитер",
                "грусть",
                "лебедь",
                "первое",
                "ритуал",
                "террор",
                "пионер",
                "братец",
                "железа",
                "прорыв",
                "тормоз",
                "дерьмо",
                "сервис",
                "скамья",
                "фильтр",
                "мистер",
                "пехота",
                "участь",
                "анкета",
                "райком",
                "сторож",
                "грузин",
                "пальма",
                "шедевр",
                "листва",
                "совхоз",
                "сустав",
                "уборка",
                "покров",
                "разгар",
                "водоем",
                "измена",
                "подбор",
                "скидка",
                "струна",
                "библия",
                "голубь",
                "запуск",
                "сияние",
                "чепуха",
                "земляк",
                "крошка",
                "чердак",
                "розыск",
                "массив",
                "поклон",
                "банкир",
                "нищета",
                "помеха",
                "сериал",
                "вектор",
                "кривая",
                "курорт",
                "птичка",
                "гигант",
                "купюра",
                "силуэт",
                "фашизм",
                "ворона",
                "глагол",
                "ноздря",
                "динамо",
                "снятие",
                "сундук",
                "свалка",
                "стопка",
                "стресс",
                "теннис",
                "мамаша",
                "бульон",
                "чекист",
                "ведьма",
                "ректор",
                "сирота",
                "клапан",
                "мостик",
                "клятва",
                "кролик",
                "монтаж",
                "окурок",
                "разбор",
                "дядька",
                "отклик",
                "троица",
                "казино",
                "хоккей",
                "вырост",
                "дефект",
                "поднос",
                "банкет",
                "обилие",
                "плитка",
                "гектар",
                "погоня",
                "лезвие",
                "романс",
                "скорбь",
                "доцент",
                "приток",
                "прокат",
                "хребет",
                "сугроб",
                "убитый",
                "ущелье",
                "ячейка",
                "забава",
                "зонтик",
                "царица",
                "выступ",
                "притча",
                "развал",
                "боярин",
                "выброс",
                "дружка",
                "нарком",
                "стимул",
                "значок",
                "клочок",
                "копыто",
                "пассаж",
                "перила",
                "перрон",
                "реестр",
                "скелет",
                "чистка",
                "умница",
                "широта",
                "сборка",
                "индеец",
                "подлец",
                "дружок",
                "конунг",
                "штучка",
                "альянс",
                "злодей",
                "зрачок",
                "конвой",
                "мишень",
                "мудрец",
                "радиус",
                "трепет",
                "яблоня",
                "датчик",
                "патент",
                "тундра",
                "шашлык",
                "зараза",
                "люстра",
                "папаша",
                "засада",
                "кабель",
                "лесхоз",
                "солома",
                "тополь",
                "гормон",
                "причал",
                "резина",
                "глотка",
                "пастух",
                "геолог",
                "кромка",
                "массаж",
                "привод",
                "рельеф",
                "рудник",
                "ступня",
                "двойка",
                "иголка",
                "карета",
                "корона",
                "хищник",
                "второе",
                "караул",
                "прицел",
                "триумф",
                "алтарь",
                "саммит",
                "спикер",
                "абсурд",
                "вранье",
                "имение",
                "помада",
                "рапорт",
                "брызги",
                "раскол",
                "гостья",
                "монстр",
                "отсчет",
                "пазуха",
                "прутик",
                "туризм",
                "дворик",
                "кашель",
                "удочка",
                "улочка",
                "калина",
                "канава",
                "каркас",
                "клумба",
                "солист",
                "травка",
                "унитаз",
                "китель",
                "педаль",
                "реалия",
                "сумрак",
                "фермер",
                "бросок",
                "затвор",
                "свечка",
                "чеснок",
                "легион",
                "отдача",
                "паркет",
                "планка",
                "сатира",
                "коготь",
                "боязнь",
                "бритва",
                "изолят",
                "карьер",
                "лирика",
                "оратор",
                "сирень",
                "строфа",
                "шляпка",
                "богиня",
                "грядка",
                "колпак",
                "мрамор",
                "пьяный",
                "радуга",
                "шахтер",
                "ключик",
                "комбат",
                "матрас",
                "погреб",
                "техник",
                "футляр",
                "череда",
                "кобура",
                "личико",
                "синева",
                "башмак",
                "метель",
                "сводка",
                "утечка",
                "калибр",
                "стирка",
                "третья",
                "дюжина",
                "оргазм",
                "горком",
                "грабеж",
                "кровля",
                "лизинг",
                "лысина",
                "мюзикл",
                "опушка",
                "скачок",
                "тайник",
                "шнурок",
                "биолог",
                "дикарь",
                "мамонт",
                "никель",
                "свекла",
                "сервер",
                "собрат",
                "целина",
                "выемка",
                "погром",
                "разгон",
                "сухарь",
                "утопия",
                "застой",
                "компот",
                "малина",
                "мускул",
                "слепой",
                "тендер",
                "эталон",
                "ватник",
                "дизель",
                "каприз",
                "коврик",
                "лапоть",
                "ливень",
                "сатана",
                "уговор",
                "чучело",
                "аккорд",
                "вражда",
                "мандат",
                "пряник",
                "сирена",
                "спешка",
                "брюшко",
                "графин",
                "киллер",
                "обиход",
                "прилив",
                "пьянка",
                "родник",
                "седина",
                "сортир",
                "ураган",
                "вакуум",
                "горсть",
                "зайчик",
                "клубок",
                "кувшин",
                "курьер",
                "промах",
                "роддом",
                "сигара",
                "хлопок",
                "ходьба",
                "цемент",
                "бронза",
                "герцог",
                "кинжал",
                "опаска",
                "свинец",
                "сливки",
                "упадок",
                "братия",
                "колдун",
                "кузнец",
                "монарх",
                "плазма",
                "трение",
                "витязь",
                "острие",
                "тамбур",
                "флакон",
                "десант",
                "карлик",
                "корыто",
                "маньяк",
                "округа",
                "отвага",
                "сговор",
                "скобка",
                "смазка",
                "бармен",
                "беглец",
                "залежь",
                "колода",
                "мольба",
                "нянька",
                "пробел",
                "пролив",
                "султан",
                "узелок",
                "щелчок",
                "артель",
                "баллон",
                "восход",
                "княжна",
                "пляска",
                "протез",
                "разлом",
                "фургон",
                "льдина",
                "мечеть",
                "натиск",
                "осадок",
                "фартук",
                "вулкан",
                "козырь",
                "магнит",
                "насыпь",
                "пастор",
                "ручеек",
                "стерва",
                "флажок",
                "шелест",
                "блузка",
                "духота",
                "карниз",
                "косарь",
                "ладоши",
                "милорд",
                "наклон",
                "осадки",
                "пелена",
                "управа",
                "цинизм",
                "эгоизм",
                "атаман",
                "детище",
                "кобыла",
                "охапка",
                "пароль",
                "ругань",
                "смешок",
                "сорока",
                "стукач",
                "фанера",
                "флейта",
                "шлюпка",
                "генсек",
                "дождик",
                "кладка",
                "монгол",
                "серьга",
                "уныние",
                "хватка",
                "хижина",
                "эпопея",
                "бутыль",
                "диктор",
                "картон",
                "прямая",
                "стайка",
                "умысел",
                "эпитет",
                "взятие",
                "глобус",
                "гранит",
                "дефолт",
                "зигзаг",
                "макияж",
                "модерн",
                "прадед",
                "пролет",
                "трофей",
                "угодье",
                "уголек",
                "щетина",
                "арбитр",
                "бархат",
                "болван",
                "каскад",
                "катюша",
                "кореец",
                "полено",
                "резьба",
                "фреска",
                "шаблон",
                "блюдце",
                "боксер",
                "зверек",
                "карцер",
                "кобель",
                "овация",
                "раввин",
                "радист",
                "боцман",
                "бункер",
                "героин",
                "гибрид",
                "гильза",
                "допуск",
                "ночлег",
                "рацион",
                "свинка",
                "социум",
                "стишок",
                "сценка",
                "братва",
                "елочка",
                "жемчуг",
                "качели",
                "курган",
                "пробег",
                "варвар",
                "галька",
                "кисель",
                "кустик",
                "лавина",
                "лифчик",
                "лучшее",
                "мякоть",
                "подрыв",
                "ракурс",
                "рябина",
                "сжатие",
                "творог",
                "топчан",
                "трость",
                "тряпье",
                "абажур",
                "бушлат",
                "галоша",
                "гарант",
                "дачник",
                "лайнер",
                "ломтик",
                "натрий",
                "рвение",
                "снежок",
                "тягота",
                "экстаз",
                "гипноз",
                "декрет",
                "дрожжи",
                "завеса",
                "компас",
                "консул",
                "ледник",
                "медуза",
                "опилки",
                "персик",
                "прибой",
                "танцор",
                "калека",
                "маркиз",
                "микроб",
                "наркоз",
                "оконце",
                "пижама",
                "подтип",
                "путник",
                "фараон",
                "фарфор",
                "шкурка",
                "атеист",
                "выкрик",
                "гравий",
                "детдом",
                "кактус",
                "каштан",
                "куплет",
                "латынь",
                "листик",
                "матрац",
                "пивная",
                "птенец",
                "росток",
                "скачка",
                "сударь",
                "фальшь",
                "бабуля",
                "буксир",
                "каратэ",
                "клякса",
                "марево",
                "обойма",
                "пептид",
                "разлив",
                "старое",
                "хлопец",
                "бардак",
                "браток",
                "дебаты",
                "клеймо",
                "клинок",
                "лишнее",
                "нацист",
                "нейрон",
                "оптика",
                "пермяк",
                "слежка",
                "сорняк",
                "червяк",
                "гавань",
                "голень",
                "ковбой",
                "немощь",
                "отсвет",
                "сажень",
                "словцо",
                "сперма",
                "фольга",
                "шантаж",
                "батька",
                "долька",
                "нагрев",
                "общага",
                "оправа",
                "партер",
                "паства",
                "подвох",
                "призер",
                "прицеп",
                "прораб",
                "уловка",
                "холмик",
                "штанга",
                "акация",
                "ателье",
                "вахтер",
                "жаргон",
                "ломоть",
                "лоскут",
                "мантия",
                "пикник",
                "подиум",
                "портал",
                "сварка",
                "умелец",
                "этикет",
                "вампир",
                "веяние",
                "десерт",
                "дубина",
                "жребий",
                "завхоз",
                "игумен",
                "мимика",
                "орешек",
                "пенсне",
                "помост",
                "пряжка",
                "разгул",
                "рассол",
                "травля",
                "тропка",
                "хлопья",
                "шелуха",
                "ведомо",
                "кокаин",
                "лектор",
                "людоед",
                "магнат",
                "настил",
                "отрава",
                "пощада",
                "прииск",
                "утварь",
                "фантом",
                "герпес",
                "дельта",
                "засуха",
                "кассир",
                "макака",
                "осанка",
                "прения",
                "протон",
                "пучина",
                "пыльца",
                "реванш",
                "резюме",
                "сервиз",
                "соната",
                "стычка",
                "фляжка",
                "холера",
                "азбука",
                "амплуа",
                "ампула",
                "амулет",
                "бампер",
                "банька",
                "бедняк",
                "богема",
                "винтик",
                "грабли",
                "гроздь",
                "декада",
                "диабет",
                "жвачка",
                "капкан",
                "кордон",
                "кортеж",
                "кретин",
                "матерь",
                "мичман",
                "настой",
                "повтор",
                "подряд",
                "призма",
                "пролог",
                "расизм",
                "рыбина",
                "субтип",
                "тельце",
                "термос",
                "фиалка",
                "язычок",
                "ананас",
                "барыня",
                "бублик",
                "вещица",
                "грудка",
                "деготь",
                "диспут",
                "догмат",
                "жратва",
                "зарево",
                "комета",
                "лесник",
                "лоджия",
                "маркер",
                "неволя",
                "недруг",
                "полынь",
                "разбег",
                "специя",
                "ювелир",
                "ястреб",
                "бабуся",
                "бурьян",
                "витраж",
                "клюква",
                "копоть",
                "кубрик",
                "кузина",
                "лекарь",
                "мессия",
                "мозоль",
                "наплыв",
                "отмель",
                "привал",
                "слоган",
                "снасть",
                "цензор",
                "эпилог",
                "бордюр",
                "бостон",
                "всхлип",
                "газель",
                "домино",
                "калоша",
                "ковчег",
                "магний",
                "мачеха",
                "одежка",
                "отзвук",
                "папаха",
                "прикол",
                "припас",
                "прокол",
                "слиток",
                "сюртук",
                "танкер",
                "ушанка",
                "чаяние",
                "челнок",
                "швабра",
                "эгоист",
                "юбиляр",
                "ящичек",
                "бантик",
                "буклет",
                "вымпел",
                "желток",
                "иерарх",
                "кабаре",
                "картер",
                "конфуз",
                "лагуна",
                "лентяй",
                "низина",
                "параша",
                "пробор",
                "разбой",
                "смычок",
                "соболь",
                "халява",
                "шмотки",
                "болтун",
                "брусок",
                "гадина",
                "галифе",
                "дверка",
                "йогурт",
                "опекун",
                "плевок",
                "потеха",
                "псалом",
                "сеянец",
                "сотник",
                "темень",
                "членик",
                "агония",
                "братан",
                "буржуй",
                "зевака",
                "кожура",
                "костяк",
                "месиво",
                "миссис",
                "мясник",
                "облава",
                "пловец",
                "примус",
                "проток",
                "страус",
                "триада",
                "фосфор",
                "апатия",
                "атташе",
                "бритье",
                "брокер",
                "вскрик",
                "грибок",
                "детина",
                "доярка",
                "желвак",
                "заслон",
                "кожица",
                "курево",
                "одышка",
                "склока",
                "таджик",
                "толчея",
                "увечье",
                "улитка",
                "утроба",
                "фасоль",
                "шутник",
                "щебень",
                "грация",
                "грызун",
                "движок",
                "зануда",
                "зодчий",
                "индиец",
                "ландыш",
                "люлька",
                "маразм",
                "маузер",
                "обивка",
                "пальба",
                "писарь",
                "покрой",
                "пчелка",
                "разлад",
                "синица",
                "фабула",
                "эколог",
                "аммиак",
                "атеизм",
                "водила",
                "диакон",
                "изотоп",
                "каньон",
                "капрал",
                "карась",
                "комдив",
                "кьянти",
                "лисица",
                "логово",
                "лыжник",
                "невроз",
                "прогон",
                "раздор",
                "разнос",
                "рутина",
                "спящий",
                "тирада",
                "трешка",
                "фрегат",
                "хромой",
                "ямочка",
                "ангина",
                "аншлаг",
                "бдение",
                "глухой",
                "змейка",
                "кафель",
                "лацкан",
                "литера",
                "нагота",
                "надрыв",
                "нажива",
                "натуга",
                "немота",
                "оракул",
                "оттиск",
                "пилюля",
                "подкуп",
                "похоть",
                "психоз",
                "столяр",
                "сфинкс",
                "фитиль",
                "иезуит",
                "ротный",
                "глупец",
                "пудель",
                "свиток",
                "чудище",
                "горняк",
                "раскат",
                "эрозия",
                "овечка",
                "ельник",
                "токарь",
                "фикция",
                "лужица",
                "распря",
                "тюлень",
            ],
            7: [
                "человек",
                "сторона",
                "ребенок",
                "система",
                "женщина",
                "решение",
                "история",
                "область",
                "процесс",
                "условие",
                "уровень",
                "комната",
                "порядок",
                "интерес",
                "правило",
                "мужчина",
                "чувство",
                "причина",
                "товарищ",
                "встреча",
                "девушка",
                "очередь",
                "событие",
                "принцип",
                "мальчик",
                "участие",
                "девочка",
                "картина",
                "рисунок",
                "течение",
                "церковь",
                "свобода",
                "команда",
                "договор",
                "природа",
                "телефон",
                "позиция",
                "самолет",
                "процент",
                "степень",
                "надежда",
                "предмет",
                "вариант",
                "министр",
                "граница",
                "миллион",
                "счастье",
                "кабинет",
                "магазин",
                "площадь",
                "возраст",
                "участок",
                "желание",
                "генерал",
                "понятие",
                "радость",
                "продукт",
                "реформа",
                "будущее",
                "рассказ",
                "техника",
                "деревня",
                "элемент",
                "функция",
                "капитан",
                "фамилия",
                "бутылка",
                "влияние",
                "учитель",
                "корабль",
                "детство",
                "прошлое",
                "коридор",
                "болезнь",
                "попытка",
                "депутат",
                "комитет",
                "десяток",
                "глубина",
                "студент",
                "секунда",
                "станция",
                "бабушка",
                "столица",
                "энергия",
                "реакция",
                "отличие",
                "красота",
                "явление",
                "наличие",
                "больной",
                "декабрь",
                "октябрь",
                "занятие",
                "зритель",
                "концерт",
                "милиция",
                "переход",
                "кровать",
                "аппарат",
                "отрасль",
                "продажа",
                "образец",
                "главное",
                "таблица",
                "коллега",
                "оборона",
                "подруга",
                "признак",
                "перевод",
                "русский",
                "подарок",
                "конкурс",
                "просьба",
                "публика",
                "реклама",
                "портрет",
                "зеркало",
                "поездка",
                "февраль",
                "издание",
                "темнота",
                "партнер",
                "страсть",
                "разница",
                "формула",
                "капитал",
                "новость",
                "эксперт",
                "автобус",
                "общение",
                "рабочий",
                "постель",
                "инженер",
                "старуха",
                "вершина",
                "записка",
                "совесть",
                "господь",
                "потолок",
                "контакт",
                "восторг",
                "автомат",
                "поселок",
                "поворот",
                "дыхание",
                "масштаб",
                "хозяйка",
                "москвич",
                "остаток",
                "затрата",
                "единица",
                "изделие",
                "молитва",
                "планета",
                "минимум",
                "тревога",
                "задание",
                "бригада",
                "надпись",
                "паспорт",
                "адвокат",
                "коробка",
                "дедушка",
                "прибыль",
                "лечение",
                "рубашка",
                "политик",
                "экзамен",
                "питание",
                "оркестр",
                "критика",
                "религия",
                "карьера",
                "чемодан",
                "скандал",
                "покупка",
                "доверие",
                "колонна",
                "падение",
                "ведение",
                "тарелка",
                "деятель",
                "выстрел",
                "полгода",
                "подпись",
                "актриса",
                "прогноз",
                "повесть",
                "свадьба",
                "подушка",
                "справка",
                "ботинок",
                "молодец",
                "авиация",
                "дневник",
                "полиция",
                "полчаса",
                "бумажка",
                "империя",
                "суббота",
                "дорожка",
                "историк",
                "замысел",
                "фабрика",
                "училище",
                "городок",
                "легенда",
                "частица",
                "крыльцо",
                "пациент",
                "тяжесть",
                "кусочек",
                "военный",
                "чемпион",
                "копейка",
                "раствор",
                "анекдот",
                "награда",
                "маршрут",
                "сержант",
                "дивизия",
                "бассейн",
                "медведь",
                "квартал",
                "топливо",
                "пустота",
                "премьер",
                "француз",
                "сиденье",
                "выплата",
                "перерыв",
                "спутник",
                "веревка",
                "ступень",
                "затылок",
                "невеста",
                "посадка",
                "царство",
                "экспорт",
                "профиль",
                "учебник",
                "игрушка",
                "философ",
                "олигарх",
                "строчка",
                "сборная",
                "кафедра",
                "напиток",
                "пятница",
                "оттенок",
                "пустыня",
                "сборник",
                "среднее",
                "чистота",
                "асфальт",
                "палатка",
                "ветеран",
                "решетка",
                "батарея",
                "рейтинг",
                "соседка",
                "завтрак",
                "заслуга",
                "контора",
                "трамвай",
                "галстук",
                "колбаса",
                "лишение",
                "протест",
                "педагог",
                "видение",
                "семинар",
                "охотник",
                "фракция",
                "насилие",
                "спальня",
                "инвалид",
                "финансы",
                "цепочка",
                "трибуна",
                "загадка",
                "заметка",
                "владыка",
                "диаметр",
                "конверт",
                "неудача",
                "рассвет",
                "сволочь",
                "мелодия",
                "раненый",
                "полнота",
                "индивид",
                "пароход",
                "машинка",
                "супруга",
                "иллюзия",
                "союзник",
                "колодец",
                "реплика",
                "словарь",
                "простор",
                "близкие",
                "вспышка",
                "пособие",
                "жалость",
                "тетрадь",
                "кислота",
                "дефицит",
                "спасибо",
                "галерея",
                "держава",
                "зависть",
                "тротуар",
                "стрелка",
                "трактор",
                "головка",
                "зрелище",
                "комедия",
                "должник",
                "клиника",
                "частота",
                "материя",
                "желудок",
                "апостол",
                "бульвар",
                "четверг",
                "капуста",
                "пулемет",
                "окраина",
                "бабочка",
                "палочка",
                "поцелуй",
                "сумерки",
                "лауреат",
                "феномен",
                "героиня",
                "чеченец",
                "милость",
                "потомок",
                "осколок",
                "приступ",
                "тактика",
                "психика",
                "полдень",
                "толщина",
                "конфета",
                "корзина",
                "полотно",
                "вторник",
                "епископ",
                "полоска",
                "пропуск",
                "колония",
                "витрина",
                "госпожа",
                "шахматы",
                "батюшка",
                "диагноз",
                "трещина",
                "витамин",
                "агрегат",
                "калитка",
                "окраска",
                "татарин",
                "вакцина",
                "скрипка",
                "примета",
                "классик",
                "возврат",
                "импульс",
                "находка",
                "стадион",
                "особняк",
                "стоянка",
                "десятка",
                "усадьба",
                "величие",
                "стройка",
                "челюсть",
                "аукцион",
                "полночь",
                "интрига",
                "квадрат",
                "ясность",
                "грамота",
                "доброта",
                "коляска",
                "порошок",
                "сюрприз",
                "беженец",
                "подобие",
                "обложка",
                "ресница",
                "кассета",
                "походка",
                "монолог",
                "пятерка",
                "матушка",
                "поручик",
                "занавес",
                "концерн",
                "колокол",
                "барабан",
                "песенка",
                "граната",
                "заговор",
                "писание",
                "догадка",
                "роскошь",
                "новинка",
                "помидор",
                "эстрада",
                "аппетит",
                "отметка",
                "фуражка",
                "валенок",
                "сегмент",
                "безумие",
                "мертвый",
                "ранение",
                "санкция",
                "серебро",
                "закуска",
                "очистка",
                "терраса",
                "холдинг",
                "призрак",
                "схватка",
                "дирижер",
                "новичок",
                "обочина",
                "пошлина",
                "хлопоты",
                "воробей",
                "котенок",
                "прирост",
                "гепатит",
                "волокно",
                "курсант",
                "складка",
                "сумочка",
                "юстиция",
                "веселье",
                "персона",
                "фигурка",
                "деление",
                "закупка",
                "слияние",
                "отрывок",
                "каталог",
                "переезд",
                "полигон",
                "спонсор",
                "обломок",
                "старина",
                "адмирал",
                "веранда",
                "всадник",
                "казарма",
                "матрица",
                "посылка",
                "ярмарка",
                "генштаб",
                "гонорар",
                "емкость",
                "стебель",
                "амбиция",
                "дворник",
                "патриот",
                "подсчет",
                "соблазн",
                "усмешка",
                "барышня",
                "механик",
                "цензура",
                "варенье",
                "ловушка",
                "мамочка",
                "полость",
                "престол",
                "блокнот",
                "лопатка",
                "негодяй",
                "острота",
                "арсенал",
                "задница",
                "лавочка",
                "парочка",
                "правота",
                "предлог",
                "уступка",
                "коленка",
                "цилиндр",
                "заросль",
                "зоопарк",
                "избыток",
                "кончина",
                "молоток",
                "гадость",
                "должное",
                "колледж",
                "морщина",
                "перелом",
                "муравей",
                "пирожок",
                "собачка",
                "ветерок",
                "кавалер",
                "путевка",
                "ремесло",
                "гвардия",
                "комфорт",
                "сенатор",
                "мемуары",
                "рубрика",
                "комбайн",
                "пружина",
                "самовар",
                "симптом",
                "инфаркт",
                "княгиня",
                "конюшня",
                "лопасть",
                "обрывок",
                "пленный",
                "хулиган",
                "шапочка",
                "вывеска",
                "добавка",
                "кошелек",
                "обаяние",
                "паровоз",
                "старший",
                "часовой",
                "выпивка",
                "паутина",
                "верблюд",
                "котлета",
                "бегство",
                "епархия",
                "хроника",
                "армянин",
                "кипяток",
                "обитель",
                "похвала",
                "скотина",
                "атрибут",
                "инерция",
                "колонка",
                "подошва",
                "шоколад",
                "выручка",
                "перенос",
                "пьяница",
                "санитар",
                "абонент",
                "бинокль",
                "близнец",
                "катание",
                "гребень",
                "лягушка",
                "чернила",
                "выдумка",
                "котелок",
                "пальчик",
                "пшеница",
                "тележка",
                "ведущий",
                "выигрыш",
                "обморок",
                "отрезок",
                "разлука",
                "таракан",
                "уборная",
                "всплеск",
                "коттедж",
                "расцвет",
                "родство",
                "спецназ",
                "таможня",
                "выборка",
                "клавиша",
                "мучение",
                "отделка",
                "пианист",
                "реализм",
                "фонарик",
                "паренек",
                "повязка",
                "попугай",
                "разгром",
                "ближний",
                "вексель",
                "парашют",
                "любимец",
                "помойка",
                "антиген",
                "выходец",
                "монитор",
                "пустырь",
                "водород",
                "волосок",
                "дружина",
                "ладошка",
                "минутка",
                "рабство",
                "синдром",
                "детишки",
                "либерал",
                "спираль",
                "вестник",
                "передел",
                "сидение",
                "тапочка",
                "терапия",
                "цыпочки",
                "небытие",
                "равнина",
                "рыбалка",
                "слесарь",
                "соавтор",
                "костыль",
                "минерал",
                "полвека",
                "стрелок",
                "воронка",
                "ниточка",
                "убежище",
                "опухоль",
                "святыня",
                "сметана",
                "пузырек",
                "сплетня",
                "таксист",
                "вешалка",
                "грузчик",
                "мертвец",
                "морковь",
                "престиж",
                "теорема",
                "воевода",
                "выписка",
                "делегат",
                "макушка",
                "ножницы",
                "станица",
                "артерия",
                "избушка",
                "линейка",
                "аксиома",
                "антенна",
                "козырек",
                "сережка",
                "катушка",
                "селение",
                "счетчик",
                "возглас",
                "носилки",
                "просвет",
                "роспись",
                "сечение",
                "сувенир",
                "тоннель",
                "укрытие",
                "бедняга",
                "горючее",
                "джунгли",
                "материк",
                "фаворит",
                "выговор",
                "действо",
                "камешек",
                "коммуна",
                "останки",
                "сверток",
                "беседка",
                "двойник",
                "ложечка",
                "лошадка",
                "мигрант",
                "патруль",
                "снайпер",
                "чашечка",
                "дядюшка",
                "карабин",
                "малость",
                "печенье",
                "соловей",
                "теленок",
                "больная",
                "идеолог",
                "мученик",
                "струйка",
                "графиня",
                "гримаса",
                "дурачок",
                "примесь",
                "танкист",
                "теплота",
                "траншея",
                "дельфин",
                "обстрел",
                "пианино",
                "расклад",
                "резинка",
                "сырость",
                "керосин",
                "курение",
                "пристав",
                "сосиска",
                "центнер",
                "бродяга",
                "заемщик",
                "створка",
                "тетушка",
                "блокада",
                "брошюра",
                "водопад",
                "новизна",
                "селедка",
                "силовик",
                "табурет",
                "трактат",
                "фермент",
                "баночка",
                "бородка",
                "плотник",
                "полпред",
                "стрижка",
                "березка",
                "краешек",
                "мужичок",
                "мутация",
                "перевал",
                "пешеход",
                "подонок",
                "скрипач",
                "ученица",
                "чернота",
                "шествие",
                "веточка",
                "мешочек",
                "дырочка",
                "поводок",
                "рядовой",
                "семечко",
                "эмиссия",
                "пластик",
                "полимер",
                "помещик",
                "поминки",
                "приклад",
                "прозаик",
                "рефлекс",
                "адресат",
                "браслет",
                "гестапо",
                "католик",
                "личинка",
                "лужайка",
                "пакетик",
                "пародия",
                "розочка",
                "синоним",
                "столбик",
                "голосок",
                "денежки",
                "испанец",
                "новелла",
                "папочка",
                "присяга",
                "реактор",
                "светило",
                "тусовка",
                "умерший",
                "брезент",
                "кластер",
                "пленник",
                "поприще",
                "стеллаж",
                "трапеза",
                "грешник",
                "настрой",
                "пастырь",
                "ромашка",
                "сапожок",
                "штурман",
                "великан",
                "камушек",
                "клевета",
                "колечко",
                "корешок",
                "мистика",
                "овчарка",
                "пятачок",
                "гаишник",
                "гравюра",
                "духовка",
                "жеребец",
                "канцлер",
                "караван",
                "плотина",
                "теснота",
                "тошнота",
                "углерод",
                "генотип",
                "дурочка",
                "крапива",
                "румянец",
                "толстяк",
                "транзит",
                "хищение",
                "цветник",
                "графика",
                "лепешка",
                "маэстро",
                "пылесос",
                "ревизор",
                "россыпь",
                "самогон",
                "туннель",
                "филолог",
                "хамство",
                "шампунь",
                "белизна",
                "конвоир",
                "крестик",
                "полочка",
                "рыдание",
                "свинина",
                "хвостик",
                "яркость",
                "алфавит",
                "застава",
                "борозда",
                "вымысел",
                "гонение",
                "зампред",
                "зародыш",
                "колючка",
                "корочка",
                "кушетка",
                "отблеск",
                "перелет",
                "усердие",
                "цыганка",
                "шеренга",
                "бурение",
                "вставка",
                "мозаика",
                "облачко",
                "оглядка",
                "паразит",
                "повозка",
                "прихоть",
                "трусики",
                "швейцар",
                "барахло",
                "баритон",
                "галочка",
                "ипотека",
                "квартет",
                "лимузин",
                "наемник",
                "партком",
                "сорочка",
                "фанатик",
                "часовня",
                "эпиграф",
                "агроном",
                "выходка",
                "горница",
                "купание",
                "лексика",
                "мадонна",
                "миномет",
                "полянка",
                "антракт",
                "афоризм",
                "габарит",
                "героизм",
                "горение",
                "дамочка",
                "кальций",
                "клеенка",
                "начинка",
                "планшет",
                "повадка",
                "поэтика",
                "принтер",
                "радикал",
                "ревизия",
                "розетка",
                "шкафчик",
                "шуточка",
                "вещание",
                "горячка",
                "журавль",
                "кулачок",
                "помысел",
                "просчет",
                "фактура",
                "холодок",
                "баллада",
                "блиндаж",
                "вырубка",
                "гордыня",
                "девчата",
                "дубинка",
                "крейсер",
                "лотерея",
                "маятник",
                "перебор",
                "хоровод",
                "эмблема",
                "ветчина",
                "высадка",
                "географ",
                "еврейка",
                "жандарм",
                "капюшон",
                "мизинец",
                "праймер",
                "свисток",
                "скрежет",
                "трактир",
                "тренинг",
                "тюльпан",
                "упоение",
                "авоська",
                "булавка",
                "девятка",
                "деревце",
                "дощечка",
                "зарядка",
                "косынка",
                "наушник",
                "перепад",
                "поверка",
                "полицай",
                "родинка",
                "сыночек",
                "шпионаж",
                "эмбрион",
                "ягодица",
                "бильярд",
                "вратарь",
                "дотация",
                "каторга",
                "куколка",
                "монетка",
                "пилотка",
                "подвода",
                "простой",
                "турбина",
                "баррель",
                "булочка",
                "вырезка",
                "дисплей",
                "кабинка",
                "коробок",
                "лесенка",
                "обидчик",
                "пеленка",
                "пометка",
                "рюмочка",
                "цитокин",
                "яичница",
                "блондин",
                "гигиена",
                "домовой",
                "капсула",
                "кипение",
                "кукушка",
                "разврат",
                "робость",
                "сборище",
                "семерка",
                "аудитор",
                "дискурс",
                "железка",
                "зачатие",
                "искание",
                "понятой",
                "портной",
                "привкус",
                "разруха",
                "регистр",
                "старпом",
                "стрелец",
                "ударник",
                "штурвал",
                "безумец",
                "везение",
                "впадина",
                "главарь",
                "инсульт",
                "колорит",
                "кремний",
                "любимая",
                "паралич",
                "перевес",
                "ракушка",
                "тушенка",
                "халатик",
                "царевич",
                "эйфория",
                "водичка",
                "громада",
                "динамик",
                "нападки",
                "напасть",
                "раздача",
                "ремешок",
                "слепота",
                "укладка",
                "ухмылка",
                "частник",
                "айсберг",
                "буханка",
                "варежка",
                "водочка",
                "горелка",
                "излишек",
                "кабачок",
                "локатор",
                "новация",
                "одеяние",
                "петушок",
                "русалка",
                "связист",
                "сгусток",
                "шиворот",
                "штабель",
                "яблочко",
                "баранка",
                "бугорок",
                "вердикт",
                "задаток",
                "запятая",
                "иудаизм",
                "каморка",
                "мещанин",
                "ношение",
                "плесень",
                "подмена",
                "приемка",
                "скептик",
                "флигель",
                "ажиотаж",
                "глухарь",
                "насморк",
                "огурчик",
                "прямота",
                "реприза",
                "упряжка",
                "черенок",
                "язычник",
                "алгебра",
                "баталия",
                "буддизм",
                "вентиль",
                "вышивка",
                "завязка",
                "затишье",
                "кавычка",
                "комочек",
                "косичка",
                "обнимка",
                "перебой",
                "пингвин",
                "питомец",
                "подступ",
                "поломка",
                "полпути",
                "почести",
                "рыболов",
                "слобода",
                "башенка",
                "белорус",
                "виртуоз",
                "горошек",
                "гулянье",
                "забытье",
                "идиотка",
                "куратор",
                "молебен",
                "нейтрон",
                "отпрыск",
                "панцирь",
                "сарафан",
                "стружка",
                "туземец",
                "банкрот",
                "бастион",
                "депозит",
                "досмотр",
                "доспехи",
                "колодка",
                "корысть",
                "кружева",
                "мегафон",
                "мирянин",
                "обличье",
                "пакость",
                "подкова",
                "получас",
                "потемки",
                "пропажа",
                "рулетка",
                "сифилис",
                "штанина",
                "визитка",
                "дешевка",
                "дружище",
                "закуток",
                "здравие",
                "истукан",
                "канадец",
                "ключица",
                "корифей",
                "кочегар",
                "кружево",
                "логотип",
                "магистр",
                "могилка",
                "неверие",
                "нечисть",
                "плетень",
                "подмога",
                "придача",
                "рентген",
                "саженец",
                "смокинг",
                "тупость",
                "усопший",
                "устрица",
                "фарисей",
                "шпилька",
                "ящерица",
                "ведущая",
                "водолаз",
                "вылазка",
                "лексема",
                "майонез",
                "наводка",
                "ночевка",
                "палитра",
                "парторг",
                "причуда",
                "реагент",
                "садовод",
                "халтура",
                "цигарка",
                "аттитюд",
                "афганец",
                "горчица",
                "домишко",
                "доплата",
                "изнанка",
                "изумруд",
                "именины",
                "инициал",
                "искорка",
                "лазарет",
                "ледокол",
                "махорка",
                "несение",
                "одессит",
                "ошейник",
                "получка",
                "поршень",
                "прорубь",
                "ребятки",
                "ссадина",
                "стояние",
                "ублюдок",
                "эротика",
                "абрикос",
                "аграрий",
                "апофеоз",
                "блатной",
                "геноцид",
                "главком",
                "дикость",
                "домысел",
                "идиллия",
                "кухарка",
                "моллюск",
                "молочко",
                "натяжка",
                "обелиск",
                "обертка",
                "патефон",
                "пейджер",
                "перышко",
                "печенка",
                "плавник",
                "профком",
                "пылинка",
                "ракетка",
                "рассада",
                "рукоять",
                "седьмая",
                "тропарь",
                "шалость",
                "шипение",
                "эстонец",
                "болячка",
                "вареник",
                "верзила",
                "гильдия",
                "донышко",
                "дочурка",
                "задачка",
                "затяжка",
                "зимовка",
                "известь",
                "малютка",
                "манекен",
                "меценат",
                "мурашки",
                "нажатие",
                "накидка",
                "пансион",
                "прорезь",
                "реквием",
                "речушка",
                "сарказм",
                "фюзеляж",
                "аптечка",
                "балаган",
                "берлога",
                "бородач",
                "высылка",
                "горстка",
                "капелла",
                "крупица",
                "лимонад",
                "маринад",
                "онанизм",
                "отчизна",
                "просека",
                "разброс",
                "реалист",
                "сибиряк",
                "теплица",
                "торпеда",
                "торпедо",
                "эрекция",
                "бальзам",
                "бегемот",
                "врачиха",
                "высотка",
                "гадание",
                "газетка",
                "гвоздик",
                "гудение",
                "густота",
                "детеныш",
                "животик",
                "малышка",
                "маникюр",
                "марафон",
                "метанол",
                "милочка",
                "наречие",
                "негатив",
                "ноутбук",
                "нянечка",
                "обмотка",
                "обшивка",
                "околица",
                "петлица",
                "поступь",
                "правнук",
                "пуговка",
                "риэлтор",
                "рогатка",
                "соломка",
                "столбец",
                "трясина",
                "абсолют",
                "блестка",
                "веление",
                "горесть",
                "гортань",
                "деточка",
                "диалект",
                "дилемма",
                "живость",
                "завиток",
                "заминка",
                "крахмал",
                "кулуары",
                "метание",
                "обслуга",
                "парапет",
                "реферат",
                "связной",
                "скверик",
                "солярка",
                "ставень",
                "хворост",
                "береста",
                "бочонок",
                "букетик",
                "вазочка",
                "вермахт",
                "вотчина",
                "дискета",
                "козерог",
                "кочерга",
                "мигалка",
                "новатор",
                "огласка",
                "партиец",
                "побоище",
                "практик",
                "происки",
                "ремарка",
                "рецидив",
                "семестр",
                "триллер",
                "царевна",
                "эмитент",
                "анархия",
                "баланда",
                "барокко",
                "беготня",
                "задумка",
                "закалка",
                "издевка",
                "клубень",
                "кузница",
                "лазейка",
                "лебедка",
                "лилипут",
                "манжета",
                "мотылек",
                "наколка",
                "обрезок",
                "пекарня",
                "передок",
                "питерец",
                "прореха",
                "пятерня",
                "слякоть",
                "стратег",
                "сухость",
                "тигрица",
                "трагизм",
                "тушение",
                "черепок",
                "чужбина",
                "бахрома",
                "визитер",
                "кофейня",
                "гадалка",
                "малышок",
                "биограф",
                "лодочка",
                "перелив",
                "гармонь",
                "сатирик",
                "сынишка",
                "форвард",
                "форпост",
                "билетик",
                "воронок",
                "седмица",
                "ведерко",
                "вещичка",
                "заплата",
                "огрызок",
                "хохолок"
            ]
        }
    };

    /* src\Popup.svelte generated by Svelte v3.46.2 */

    const file$4 = "src\\Popup.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "wrapper svelte-1qxmtfu");
    			add_location(div0, file$4, 1, 4, 34);
    			attr_dev(div1, "class", "popup svelte-1qxmtfu");
    			add_location(div1, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popup', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popup> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots, click_handler];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\MessagePopup.svelte generated by Svelte v3.46.2 */
    const file$3 = "src\\MessagePopup.svelte";

    // (15:0) {#if $model.message}
    function create_if_block$2(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	popup.$on("click", /*handleClick*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popup_changes = {};

    			if (dirty & /*$$scope, locale, formatted*/ 21) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(15:0) {#if $model.message}",
    		ctx
    	});

    	return block;
    }

    // (21:12) <Button on:click={handleClick}>
    function create_default_slot_1$1(ctx) {
    	let t_value = /*locale*/ ctx[0].ok + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*locale*/ 1 && t_value !== (t_value = /*locale*/ ctx[0].ok + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(21:12) <Button on:click={handleClick}>",
    		ctx
    	});

    	return block;
    }

    // (16:4) <Popup on:click={handleClick}>
    function create_default_slot$2(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*handleClick*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(/*formatted*/ ctx[2]);
    			t1 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "class", "window");
    			add_location(div0, file$3, 16, 8, 438);
    			attr_dev(div1, "class", "button svelte-l5wdvs");
    			add_location(div1, file$3, 19, 8, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*formatted*/ 4) set_data_dev(t0, /*formatted*/ ctx[2]);
    			const button_changes = {};

    			if (dirty & /*$$scope, locale*/ 17) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(16:4) <Popup on:click={handleClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$model*/ ctx[1].message && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$model*/ ctx[1].message) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$model*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let formatted;
    	let $model;
    	validate_store(model, 'model');
    	component_subscribe($$self, model, $$value => $$invalidate(1, $model = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MessagePopup', slots, []);
    	let { locale = {} } = $$props;

    	function handleClick() {
    		model.set($model.clearMessage());
    	}

    	const writable_props = ['locale'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MessagePopup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    	};

    	$$self.$capture_state = () => ({
    		Popup,
    		model,
    		Button,
    		locale,
    		handleClick,
    		formatted,
    		$model
    	});

    	$$self.$inject_state = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    		if ('formatted' in $$props) $$invalidate(2, formatted = $$props.formatted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$model, locale*/ 3) {
    			$$invalidate(2, formatted = ($model.messageArgs || []).reduce((m, p, i) => m.replace(`$${i}`, p), locale[$model.message]));
    		}
    	};

    	return [locale, $model, formatted, handleClick];
    }

    class MessagePopup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { locale: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MessagePopup",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get locale() {
    		throw new Error("<MessagePopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set locale(value) {
    		throw new Error("<MessagePopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\EndGamePopup.svelte generated by Svelte v3.46.2 */
    const file$2 = "src\\EndGamePopup.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (13:0) {#if $model.victory || $model.defeat}
    function create_if_block$1(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popup_changes = {};

    			if (dirty & /*$$scope, locale, $model*/ 2051) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(13:0) {#if $model.victory || $model.defeat}",
    		ctx
    	});

    	return block;
    }

    // (17:12) {#if $model.victory}
    function create_if_block_2(ctx) {
    	let table;
    	let t0;
    	let div;
    	let t1_value = /*locale*/ ctx[0].averageTries + "";
    	let t1;
    	let span;
    	let t2_value = /*$model*/ ctx[1].averageTries.toFixed(2) + "";
    	let t2;
    	let each_value_1 = /*$model*/ ctx[1].field;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div = element("div");
    			t1 = text(t1_value);
    			span = element("span");
    			t2 = text(t2_value);
    			add_location(table, file$2, 17, 16, 589);
    			attr_dev(span, "class", "tries svelte-ivue64");
    			add_location(span, file$2, 31, 42, 1349);
    			add_location(div, file$2, 31, 16, 1323);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$model, kStatusAbsent, kStatusMisplaced, kStatusCorrect*/ 2) {
    				each_value_1 = /*$model*/ ctx[1].field;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*locale*/ 1 && t1_value !== (t1_value = /*locale*/ ctx[0].averageTries + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$model*/ 2 && t2_value !== (t2_value = /*$model*/ ctx[1].averageTries.toFixed(2) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(17:12) {#if $model.victory}",
    		ctx
    	});

    	return block;
    }

    // (20:24) {#if j <= $model.currentRow}
    function create_if_block_3(ctx) {
    	let tr;
    	let t;
    	let each_value_2 = /*row*/ ctx[6];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$2, 20, 28, 732);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$model, kStatusAbsent, kStatusMisplaced, kStatusCorrect*/ 2) {
    				each_value_2 = /*row*/ ctx[6];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(20:24) {#if j <= $model.currentRow}",
    		ctx
    	});

    	return block;
    }

    // (22:32) {#each row as c, i}
    function create_each_block_2(ctx) {
    	let td;
    	let t_value = /*c*/ ctx[3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "svelte-ivue64");
    			toggle_class(td, "absent", /*$model*/ ctx[1].status[/*j*/ ctx[8]][/*i*/ ctx[10]] === kStatusAbsent);
    			toggle_class(td, "misplaced", /*$model*/ ctx[1].status[/*j*/ ctx[8]][/*i*/ ctx[10]] === kStatusMisplaced);
    			toggle_class(td, "correct", /*$model*/ ctx[1].status[/*j*/ ctx[8]][/*i*/ ctx[10]] === kStatusCorrect);
    			add_location(td, file$2, 22, 36, 827);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$model*/ 2 && t_value !== (t_value = /*c*/ ctx[3] + "")) set_data_dev(t, t_value);

    			if (dirty & /*$model, kStatusAbsent*/ 2) {
    				toggle_class(td, "absent", /*$model*/ ctx[1].status[/*j*/ ctx[8]][/*i*/ ctx[10]] === kStatusAbsent);
    			}

    			if (dirty & /*$model, kStatusMisplaced*/ 2) {
    				toggle_class(td, "misplaced", /*$model*/ ctx[1].status[/*j*/ ctx[8]][/*i*/ ctx[10]] === kStatusMisplaced);
    			}

    			if (dirty & /*$model, kStatusCorrect*/ 2) {
    				toggle_class(td, "correct", /*$model*/ ctx[1].status[/*j*/ ctx[8]][/*i*/ ctx[10]] === kStatusCorrect);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(22:32) {#each row as c, i}",
    		ctx
    	});

    	return block;
    }

    // (19:20) {#each $model.field as row, j}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*j*/ ctx[8] <= /*$model*/ ctx[1].currentRow && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*j*/ ctx[8] <= /*$model*/ ctx[1].currentRow) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(19:20) {#each $model.field as row, j}",
    		ctx
    	});

    	return block;
    }

    // (34:12) {#if $model.defeat}
    function create_if_block_1(ctx) {
    	let div;
    	let t0_value = /*locale*/ ctx[0].guessedWord + "";
    	let t0;
    	let t1;
    	let table;
    	let tr;
    	let each_value = /*$model*/ ctx[1].guessedWord;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			table = element("table");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$2, 34, 16, 1484);
    			add_location(tr, file$2, 36, 20, 1562);
    			add_location(table, file$2, 35, 16, 1533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*locale*/ 1 && t0_value !== (t0_value = /*locale*/ ctx[0].guessedWord + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$model*/ 2) {
    				each_value = /*$model*/ ctx[1].guessedWord;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(34:12) {#if $model.defeat}",
    		ctx
    	});

    	return block;
    }

    // (38:24) {#each $model.guessedWord as c}
    function create_each_block$1(ctx) {
    	let td;
    	let t_value = /*c*/ ctx[3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "correct defeat-word svelte-ivue64");
    			add_location(td, file$2, 38, 28, 1653);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$model*/ 2 && t_value !== (t_value = /*c*/ ctx[3] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(38:24) {#each $model.guessedWord as c}",
    		ctx
    	});

    	return block;
    }

    // (45:16) <Button on:click={handleNextGameClick}>
    function create_default_slot_1(ctx) {
    	let t_value = /*locale*/ ctx[0].nextGame + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*locale*/ 1 && t_value !== (t_value = /*locale*/ ctx[0].nextGame + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(45:16) <Button on:click={handleNextGameClick}>",
    		ctx
    	});

    	return block;
    }

    // (14:4) <Popup>
    function create_default_slot$1(ctx) {
    	let div2;
    	let div0;

    	let t0_value = (/*$model*/ ctx[1].victory
    	? /*locale*/ ctx[0].victory
    	: /*locale*/ ctx[0].defeat) + "";

    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div1;
    	let button;
    	let current;
    	let if_block0 = /*$model*/ ctx[1].victory && create_if_block_2(ctx);
    	let if_block1 = /*$model*/ ctx[1].defeat && create_if_block_1(ctx);

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*handleNextGameClick*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "class", "title svelte-ivue64");
    			add_location(div0, file$2, 15, 12, 463);
    			attr_dev(div1, "class", "button svelte-ivue64");
    			add_location(div1, file$2, 43, 12, 1812);
    			attr_dev(div2, "class", "window svelte-ivue64");
    			add_location(div2, file$2, 14, 8, 429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$model, locale*/ 3) && t0_value !== (t0_value = (/*$model*/ ctx[1].victory
    			? /*locale*/ ctx[0].victory
    			: /*locale*/ ctx[0].defeat) + "")) set_data_dev(t0, t0_value);

    			if (/*$model*/ ctx[1].victory) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div2, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$model*/ ctx[1].defeat) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div2, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope, locale*/ 2049) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(14:4) <Popup>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*$model*/ ctx[1].victory || /*$model*/ ctx[1].defeat) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$model*/ ctx[1].victory || /*$model*/ ctx[1].defeat) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$model*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $model;
    	validate_store(model, 'model');
    	component_subscribe($$self, model, $$value => $$invalidate(1, $model = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EndGamePopup', slots, []);
    	let { locale = {} } = $$props;

    	function handleNextGameClick() {
    		model.set($model.init($model.guessedWord.length, $model.field.length, $model.difficulty));
    	}

    	const writable_props = ['locale'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EndGamePopup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    	};

    	$$self.$capture_state = () => ({
    		Popup,
    		kStatusAbsent,
    		kStatusCorrect,
    		kStatusMisplaced,
    		model,
    		Button,
    		locale,
    		handleNextGameClick,
    		$model
    	});

    	$$self.$inject_state = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [locale, $model, handleNextGameClick];
    }

    class EndGamePopup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { locale: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EndGamePopup",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get locale() {
    		throw new Error("<EndGamePopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set locale(value) {
    		throw new Error("<EndGamePopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Help.svelte generated by Svelte v3.46.2 */
    const file$1 = "src\\Help.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (12:0) {#if $model.screen === kScreenHelp}
    function create_if_block(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*locale*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let button;
    	let current;
    	let each_value = /*locale*/ ctx[0].help;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*handleClick*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(button.$$.fragment);
    			attr_dev(div0, "class", "title svelte-1pxo7m7");
    			add_location(div0, file$1, 13, 8, 312);
    			add_location(div1, file$1, 14, 8, 361);
    			attr_dev(div2, "class", "help svelte-1pxo7m7");
    			add_location(div2, file$1, 12, 4, 284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t2);
    			mount_component(button, div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*locale*/ 1) && t0_value !== (t0_value = /*locale*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*locale*/ 1) {
    				each_value = /*locale*/ ctx[0].help;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope, locale*/ 65) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(12:0) {#if $model.screen === kScreenHelp}",
    		ctx
    	});

    	return block;
    }

    // (16:12) {#each locale.help as l}
    function create_each_block(ctx) {
    	let html_tag;
    	let raw_value = /*l*/ ctx[3] + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*locale*/ 1 && raw_value !== (raw_value = /*l*/ ctx[3] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:12) {#each locale.help as l}",
    		ctx
    	});

    	return block;
    }

    // (20:8) <Button on:click={handleClick}>
    function create_default_slot(ctx) {
    	let t_value = /*locale*/ ctx[0].play + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*locale*/ 1 && t_value !== (t_value = /*locale*/ ctx[0].play + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(20:8) <Button on:click={handleClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$model*/ ctx[1].screen === kScreenHelp && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$model*/ ctx[1].screen === kScreenHelp) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$model*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $model;
    	validate_store(model, 'model');
    	component_subscribe($$self, model, $$value => $$invalidate(1, $model = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Help', slots, []);
    	let { locale } = $$props;

    	function handleClick() {
    		model.set($model.setScreen(kScreenGame));
    	}

    	const writable_props = ['locale'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Help> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    	};

    	$$self.$capture_state = () => ({
    		kScreenGame,
    		kScreenHelp,
    		model,
    		Button,
    		locale,
    		handleClick,
    		$model
    	});

    	$$self.$inject_state = $$props => {
    		if ('locale' in $$props) $$invalidate(0, locale = $$props.locale);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [locale, $model, handleClick];
    }

    class Help extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { locale: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Help",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*locale*/ ctx[0] === undefined && !('locale' in props)) {
    			console.warn("<Help> was created without expected prop 'locale'");
    		}
    	}

    	get locale() {
    		throw new Error("<Help>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set locale(value) {
    		throw new Error("<Help>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let title_value;
    	let meta0;
    	let meta1;
    	let meta2;
    	let link;
    	let script;
    	let t1;
    	let game;
    	let t2;
    	let help;
    	let t3;
    	let messagepopup;
    	let t4;
    	let endgamepopup;
    	let current;
    	let mounted;
    	let dispose;
    	document.title = title_value = locale.title;

    	game = new Game({
    			props: { locale, version: "beta 16" },
    			$$inline: true
    		});

    	help = new Help({ props: { locale }, $$inline: true });
    	messagepopup = new MessagePopup({ props: { locale }, $$inline: true });
    	endgamepopup = new EndGamePopup({ props: { locale }, $$inline: true });

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			link = element("link");
    			script = element("script");
    			script.textContent = "(function (m, e, t, r, i, k, a) {\n            m[i] = m[i] || function () {\n                (m[i].a = m[i].a || []).push(arguments)\n            };\n            m[i].l = 1 * new Date();\n            // noinspection CommaExpressionJS\n            k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)\n        })\n        (window, document, \"script\", \"https://mc.yandex.ru/metrika/tag.js\", \"ym\");\n\n        ym(87246213, \"init\", {\n            clickmap: true,\n            trackLinks: true,\n            accurateTrackBounce: true\n        });\n    ";
    			t1 = space();
    			create_component(game.$$.fragment);
    			t2 = space();
    			create_component(help.$$.fragment);
    			t3 = space();
    			create_component(messagepopup.$$.fragment);
    			t4 = space();
    			create_component(endgamepopup.$$.fragment);
    			attr_dev(meta0, "charset", "UTF-8");
    			add_location(meta0, file, 29, 4, 778);
    			document.title = "Еще одно слово";
    			attr_dev(meta1, "name", "keywords");
    			attr_dev(meta1, "content", "wordle, unlimited, русский, на русском, слова, игра");
    			add_location(meta1, file, 31, 4, 839);
    			attr_dev(meta2, "name", "viewport");
    			attr_dev(meta2, "content", "width=device-width, initial-scale=1.0, user-scalable=no, minimal-ui");
    			add_location(meta2, file, 32, 4, 928);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file, 33, 4, 1033);
    			attr_dev(script, "type", "text/javascript");
    			add_location(script, file, 35, 4, 1114);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, meta2);
    			append_dev(document.head, link);
    			append_dev(document.head, script);
    			insert_dev(target, t1, anchor);
    			mount_component(game, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(help, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(messagepopup, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(endgamepopup, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*locale*/ 0) && title_value !== (title_value = locale.title)) {
    				document.title = title_value;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			transition_in(help.$$.fragment, local);
    			transition_in(messagepopup.$$.fragment, local);
    			transition_in(endgamepopup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			transition_out(help.$$.fragment, local);
    			transition_out(messagepopup.$$.fragment, local);
    			transition_out(endgamepopup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			detach_dev(link);
    			detach_dev(script);
    			if (detaching) detach_dev(t1);
    			destroy_component(game, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(help, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(messagepopup, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(endgamepopup, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $model;
    	validate_store(model, 'model');
    	component_subscribe($$self, model, $$value => $$invalidate(1, $model = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	model.set(createStore(locale.dictionary, locale.keyboard).init(5, 6, 0));

    	function handleKeydown(e) {
    		let key = e.key;

    		if (key === "Enter") {
    			key = kRet;
    		} else if (key === "Backspace") {
    			key = kBsp;
    		}

    		model.set($model.insert(key));
    	}

    	onMount(async () => {
    		vnd.init();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Game,
    		createStore,
    		kBsp,
    		kRet,
    		model,
    		locale,
    		MessagePopup,
    		EndGamePopup,
    		vnd,
    		Help,
    		handleKeydown,
    		$model
    	});

    	return [handleKeydown];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
