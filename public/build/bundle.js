
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
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

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
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
    function tick() {
        schedule_update();
        return resolved_promise;
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var COMMON_MIME_TYPES = new Map([
        ['avi', 'video/avi'],
        ['gif', 'image/gif'],
        ['ico', 'image/x-icon'],
        ['jpeg', 'image/jpeg'],
        ['jpg', 'image/jpeg'],
        ['mkv', 'video/x-matroska'],
        ['mov', 'video/quicktime'],
        ['mp4', 'video/mp4'],
        ['pdf', 'application/pdf'],
        ['png', 'image/png'],
        ['zip', 'application/zip'],
        ['doc', 'application/msword'],
        ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ]);
    function toFileWithPath(file, path) {
        var f = withMimeType(file);
        if (typeof f.path !== 'string') { // on electron, path is already set to the absolute path
            var webkitRelativePath = file.webkitRelativePath;
            Object.defineProperty(f, 'path', {
                value: typeof path === 'string'
                    ? path
                    // If <input webkitdirectory> is set,
                    // the File will have a {webkitRelativePath} property
                    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
                    : typeof webkitRelativePath === 'string' && webkitRelativePath.length > 0
                        ? webkitRelativePath
                        : file.name,
                writable: false,
                configurable: false,
                enumerable: true
            });
        }
        return f;
    }
    function withMimeType(file) {
        var name = file.name;
        var hasExtension = name && name.lastIndexOf('.') !== -1;
        if (hasExtension && !file.type) {
            var ext = name.split('.')
                .pop().toLowerCase();
            var type = COMMON_MIME_TYPES.get(ext);
            if (type) {
                Object.defineProperty(file, 'type', {
                    value: type,
                    writable: false,
                    configurable: false,
                    enumerable: true
                });
            }
        }
        return file;
    }

    var FILES_TO_IGNORE = [
        // Thumbnail cache files for macOS and Windows
        '.DS_Store',
        'Thumbs.db' // Windows
    ];
    /**
     * Convert a DragEvent's DataTrasfer object to a list of File objects
     * NOTE: If some of the items are folders,
     * everything will be flattened and placed in the same list but the paths will be kept as a {path} property.
     * @param evt
     */
    function fromEvent(evt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, isDragEvt(evt) && evt.dataTransfer
                        ? getDataTransferFiles(evt.dataTransfer, evt.type)
                        : getInputFiles(evt)];
            });
        });
    }
    function isDragEvt(value) {
        return !!value.dataTransfer;
    }
    function getInputFiles(evt) {
        var files = isInput(evt.target)
            ? evt.target.files
                ? fromList(evt.target.files)
                : []
            : [];
        return files.map(function (file) { return toFileWithPath(file); });
    }
    function isInput(value) {
        return value !== null;
    }
    function getDataTransferFiles(dt, type) {
        return __awaiter(this, void 0, void 0, function () {
            var items, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!dt.items) return [3 /*break*/, 2];
                        items = fromList(dt.items)
                            .filter(function (item) { return item.kind === 'file'; });
                        // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
                        // only 'dragstart' and 'drop' has access to the data (source node)
                        if (type !== 'drop') {
                            return [2 /*return*/, items];
                        }
                        return [4 /*yield*/, Promise.all(items.map(toFilePromises))];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, noIgnoredFiles(flatten(files))];
                    case 2: return [2 /*return*/, noIgnoredFiles(fromList(dt.files)
                            .map(function (file) { return toFileWithPath(file); }))];
                }
            });
        });
    }
    function noIgnoredFiles(files) {
        return files.filter(function (file) { return FILES_TO_IGNORE.indexOf(file.name) === -1; });
    }
    // IE11 does not support Array.from()
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
    // https://developer.mozilla.org/en-US/docs/Web/API/FileList
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
    function fromList(items) {
        var files = [];
        // tslint:disable: prefer-for-of
        for (var i = 0; i < items.length; i++) {
            var file = items[i];
            files.push(file);
        }
        return files;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
    function toFilePromises(item) {
        if (typeof item.webkitGetAsEntry !== 'function') {
            return fromDataTransferItem(item);
        }
        var entry = item.webkitGetAsEntry();
        // Safari supports dropping an image node from a different window and can be retrieved using
        // the DataTransferItem.getAsFile() API
        // NOTE: FileSystemEntry.file() throws if trying to get the file
        if (entry && entry.isDirectory) {
            return fromDirEntry(entry);
        }
        return fromDataTransferItem(item);
    }
    function flatten(items) {
        return items.reduce(function (acc, files) { return __spread(acc, (Array.isArray(files) ? flatten(files) : [files])); }, []);
    }
    function fromDataTransferItem(item) {
        var file = item.getAsFile();
        if (!file) {
            return Promise.reject(item + " is not a File");
        }
        var fwp = toFileWithPath(file);
        return Promise.resolve(fwp);
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
    function fromEntry(entry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, entry.isDirectory ? fromDirEntry(entry) : fromFileEntry(entry)];
            });
        });
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
    function fromDirEntry(entry) {
        var reader = entry.createReader();
        return new Promise(function (resolve, reject) {
            var entries = [];
            function readEntries() {
                var _this = this;
                // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
                // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
                reader.readEntries(function (batch) { return __awaiter(_this, void 0, void 0, function () {
                    var files, err_1, items;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!!batch.length) return [3 /*break*/, 5];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, Promise.all(entries)];
                            case 2:
                                files = _a.sent();
                                resolve(files);
                                return [3 /*break*/, 4];
                            case 3:
                                err_1 = _a.sent();
                                reject(err_1);
                                return [3 /*break*/, 4];
                            case 4: return [3 /*break*/, 6];
                            case 5:
                                items = Promise.all(batch.map(fromEntry));
                                entries.push(items);
                                // Continue reading
                                readEntries();
                                _a.label = 6;
                            case 6: return [2 /*return*/];
                        }
                    });
                }); }, function (err) {
                    reject(err);
                });
            }
            readEntries();
        });
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
    function fromFileEntry(entry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        entry.file(function (file) {
                            var fwp = toFileWithPath(file, entry.fullPath);
                            resolve(fwp);
                        }, function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    }

    /**
     * Check if the provided file type should be accepted by the input with accept attribute.
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#attr-accept
     *
     * Inspired by https://github.com/enyo/dropzone
     *
     * @param file {File} https://developer.mozilla.org/en-US/docs/Web/API/File
     * @param acceptedFiles {string}
     * @returns {boolean}
     */

    function accepts(file, acceptedFiles) {
      if (file && acceptedFiles) {
        const acceptedFilesArray = Array.isArray(acceptedFiles)
          ? acceptedFiles
          : acceptedFiles.split(",");
        const fileName = file.name || "";
        const mimeType = (file.type || "").toLowerCase();
        const baseMimeType = mimeType.replace(/\/.*$/, "");

        return acceptedFilesArray.some((type) => {
          const validType = type.trim().toLowerCase();
          if (validType.charAt(0) === ".") {
            return fileName.toLowerCase().endsWith(validType);
          } else if (validType.endsWith("/*")) {
            // This is something like a image/* mime type
            return baseMimeType === validType.replace(/\/.*$/, "");
          }
          return mimeType === validType;
        });
      }
      return true;
    }

    // Error codes
    const FILE_INVALID_TYPE = "file-invalid-type";
    const FILE_TOO_LARGE = "file-too-large";
    const FILE_TOO_SMALL = "file-too-small";
    const TOO_MANY_FILES = "too-many-files";

    // File Errors
    const getInvalidTypeRejectionErr = (accept) => {
      accept = Array.isArray(accept) && accept.length === 1 ? accept[0] : accept;
      const messageSuffix = Array.isArray(accept)
        ? `one of ${accept.join(", ")}`
        : accept;
      return {
        code: FILE_INVALID_TYPE,
        message: `File type must be ${messageSuffix}`,
      };
    };

    const getTooLargeRejectionErr = (maxSize) => {
      return {
        code: FILE_TOO_LARGE,
        message: `File is larger than ${maxSize} bytes`,
      };
    };

    const getTooSmallRejectionErr = (minSize) => {
      return {
        code: FILE_TOO_SMALL,
        message: `File is smaller than ${minSize} bytes`,
      };
    };

    const TOO_MANY_FILES_REJECTION = {
      code: TOO_MANY_FILES,
      message: "Too many files",
    };

    // Firefox versions prior to 53 return a bogus MIME type for every file drag, so dragovers with
    // that MIME type will always be accepted
    function fileAccepted(file, accept) {
      const isAcceptable =
        file.type === "application/x-moz-file" || accepts(file, accept);
      return [
        isAcceptable,
        isAcceptable ? null : getInvalidTypeRejectionErr(accept),
      ];
    }

    function fileMatchSize(file, minSize, maxSize) {
      if (isDefined(file.size)) {
        if (isDefined(minSize) && isDefined(maxSize)) {
          if (file.size > maxSize) return [false, getTooLargeRejectionErr(maxSize)];
          if (file.size < minSize) return [false, getTooSmallRejectionErr(minSize)];
        } else if (isDefined(minSize) && file.size < minSize)
          return [false, getTooSmallRejectionErr(minSize)];
        else if (isDefined(maxSize) && file.size > maxSize)
          return [false, getTooLargeRejectionErr(maxSize)];
      }
      return [true, null];
    }

    function isDefined(value) {
      return value !== undefined && value !== null;
    }

    function allFilesAccepted({
      files,
      accept,
      minSize,
      maxSize,
      multiple,
    }) {
      if (!multiple && files.length > 1) {
        return false;
      }

      return files.every((file) => {
        const [accepted] = fileAccepted(file, accept);
        const [sizeMatch] = fileMatchSize(file, minSize, maxSize);
        return accepted && sizeMatch;
      });
    }

    // React's synthetic events has event.isPropagationStopped,
    // but to remain compatibility with other libs (Preact) fall back
    // to check event.cancelBubble
    function isPropagationStopped(event) {
      if (typeof event.isPropagationStopped === "function") {
        return event.isPropagationStopped();
      } else if (typeof event.cancelBubble !== "undefined") {
        return event.cancelBubble;
      }
      return false;
    }

    function isEvtWithFiles(event) {
      if (!event.dataTransfer) {
        return !!event.target && !!event.target.files;
      }
      // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
      return Array.prototype.some.call(
        event.dataTransfer.types,
        (type) => type === "Files" || type === "application/x-moz-file"
      );
    }

    // allow the entire document to be a drag target
    function onDocumentDragOver(event) {
      event.preventDefault();
    }

    function isIe(userAgent) {
      return (
        userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1
      );
    }

    function isEdge(userAgent) {
      return userAgent.indexOf("Edge/") !== -1;
    }

    function isIeOrEdge(userAgent = window.navigator.userAgent) {
      return isIe(userAgent) || isEdge(userAgent);
    }

    /**
     * This is intended to be used to compose event handlers
     * They are executed in order until one of them calls `event.isPropagationStopped()`.
     * Note that the check is done on the first invoke too,
     * meaning that if propagation was stopped before invoking the fns,
     * no handlers will be executed.
     *
     * @param {Function} fns the event hanlder functions
     * @return {Function} the event handler to add to an element
     */
    function composeEventHandlers(...fns) {
      return (event, ...args) =>
        fns.some((fn) => {
          if (!isPropagationStopped(event) && fn) {
            fn(event, ...args);
          }
          return isPropagationStopped(event);
        });
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$F = "";
    styleInject(css_248z$F);

    /* node_modules/svelte-file-dropzone/src/components/Dropzone.svelte generated by Svelte v3.48.0 */
    const file$d = "node_modules/svelte-file-dropzone/src/components/Dropzone.svelte";

    // (350:8)       
    function fallback_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Drag 'n' drop some files here, or click to select files";
    			add_location(p, file$d, 350, 4, 9206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(350:8)       ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let input;
    	let t;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[28].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[27], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(input, "accept", /*accept*/ ctx[0]);
    			input.multiple = /*multiple*/ ctx[1];
    			attr_dev(input, "type", "file");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "tabindex", "-1");
    			set_style(input, "display", "none");
    			add_location(input, file$d, 339, 2, 8975);
    			attr_dev(div, "tabindex", "0");
    			attr_dev(div, "class", div_class_value = "" + ((/*disableDefaultStyles*/ ctx[4] ? '' : 'dropzone') + " " + /*containerClasses*/ ctx[2] + " svelte-817dg2"));
    			attr_dev(div, "style", /*containerStyles*/ ctx[3]);
    			add_location(div, file$d, 325, 0, 8444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			/*input_binding*/ ctx[29](input);
    			append_dev(div, t);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			/*div_binding*/ ctx[30](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*onDropCb*/ ctx[14], false, false, false),
    					listen_dev(input, "click", onInputElementClick, false, false, false),
    					listen_dev(div, "keydown", /*composeKeyboardHandler*/ ctx[16](/*onKeyDownCb*/ ctx[7]), false, false, false),
    					listen_dev(div, "focus", /*composeKeyboardHandler*/ ctx[16](/*onFocusCb*/ ctx[8]), false, false, false),
    					listen_dev(div, "blur", /*composeKeyboardHandler*/ ctx[16](/*onBlurCb*/ ctx[9]), false, false, false),
    					listen_dev(div, "click", /*composeHandler*/ ctx[15](/*onClickCb*/ ctx[10]), false, false, false),
    					listen_dev(div, "dragenter", /*composeDragHandler*/ ctx[17](/*onDragEnterCb*/ ctx[11]), false, false, false),
    					listen_dev(div, "dragover", /*composeDragHandler*/ ctx[17](/*onDragOverCb*/ ctx[12]), false, false, false),
    					listen_dev(div, "dragleave", /*composeDragHandler*/ ctx[17](/*onDragLeaveCb*/ ctx[13]), false, false, false),
    					listen_dev(div, "drop", /*composeDragHandler*/ ctx[17](/*onDropCb*/ ctx[14]), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*accept*/ 1) {
    				attr_dev(input, "accept", /*accept*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*multiple*/ 2) {
    				prop_dev(input, "multiple", /*multiple*/ ctx[1]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 134217728)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[27],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[27])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[27], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty[0] & /*disableDefaultStyles, containerClasses*/ 20 && div_class_value !== (div_class_value = "" + ((/*disableDefaultStyles*/ ctx[4] ? '' : 'dropzone') + " " + /*containerClasses*/ ctx[2] + " svelte-817dg2"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*containerStyles*/ 8) {
    				attr_dev(div, "style", /*containerStyles*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input_binding*/ ctx[29](null);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*div_binding*/ ctx[30](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onInputElementClick(event) {
    	event.stopPropagation();
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropzone', slots, ['default']);
    	let { accept } = $$props;
    	let { disabled = false } = $$props;
    	let { getFilesFromEvent = fromEvent } = $$props;
    	let { maxSize = Infinity } = $$props;
    	let { minSize = 0 } = $$props;
    	let { multiple = true } = $$props;
    	let { preventDropOnDocument = true } = $$props;
    	let { noClick = false } = $$props;
    	let { noKeyboard = false } = $$props;
    	let { noDrag = false } = $$props;
    	let { noDragEventsBubbling = false } = $$props;
    	let { containerClasses = "" } = $$props;
    	let { containerStyles = "" } = $$props;
    	let { disableDefaultStyles = false } = $$props;
    	const dispatch = createEventDispatcher();

    	//state
    	let state = {
    		isFocused: false,
    		isFileDialogActive: false,
    		isDragActive: false,
    		isDragAccept: false,
    		isDragReject: false,
    		draggedFiles: [],
    		acceptedFiles: [],
    		fileRejections: []
    	};

    	let rootRef;
    	let inputRef;

    	function resetState() {
    		state.isFileDialogActive = false;
    		state.isDragActive = false;
    		state.draggedFiles = [];
    		state.acceptedFiles = [];
    		state.fileRejections = [];
    	}

    	// Fn for opening the file dialog programmatically
    	function openFileDialog() {
    		if (inputRef) {
    			$$invalidate(6, inputRef.value = null, inputRef); // TODO check if null needs to be set
    			state.isFileDialogActive = true;
    			inputRef.click();
    		}
    	}

    	// Cb to open the file dialog when SPACE/ENTER occurs on the dropzone
    	function onKeyDownCb(event) {
    		// Ignore keyboard events bubbling up the DOM tree
    		if (!rootRef || !rootRef.isEqualNode(event.target)) {
    			return;
    		}

    		if (event.keyCode === 32 || event.keyCode === 13) {
    			event.preventDefault();
    			openFileDialog();
    		}
    	}

    	// Update focus state for the dropzone
    	function onFocusCb() {
    		state.isFocused = true;
    	}

    	function onBlurCb() {
    		state.isFocused = false;
    	}

    	// Cb to open the file dialog when click occurs on the dropzone
    	function onClickCb() {
    		if (noClick) {
    			return;
    		}

    		// In IE11/Edge the file-browser dialog is blocking, therefore, use setTimeout()
    		// to ensure React can handle state changes
    		// See: https://github.com/react-dropzone/react-dropzone/issues/450
    		if (isIeOrEdge()) {
    			setTimeout(openFileDialog, 0);
    		} else {
    			openFileDialog();
    		}
    	}

    	function onDragEnterCb(event) {
    		event.preventDefault();
    		stopPropagation(event);
    		dragTargetsRef = [...dragTargetsRef, event.target];

    		if (isEvtWithFiles(event)) {
    			Promise.resolve(getFilesFromEvent(event)).then(draggedFiles => {
    				if (isPropagationStopped(event) && !noDragEventsBubbling) {
    					return;
    				}

    				state.draggedFiles = draggedFiles;
    				state.isDragActive = true;
    				dispatch("dragenter", { dragEvent: event });
    			});
    		}
    	}

    	function onDragOverCb(event) {
    		event.preventDefault();
    		stopPropagation(event);

    		if (event.dataTransfer) {
    			try {
    				event.dataTransfer.dropEffect = "copy";
    			} catch {
    				
    			} /* eslint-disable-line no-empty */
    		}

    		if (isEvtWithFiles(event)) {
    			dispatch("dragover", { dragEvent: event });
    		}

    		return false;
    	}

    	function onDragLeaveCb(event) {
    		event.preventDefault();
    		stopPropagation(event);

    		// Only deactivate once the dropzone and all children have been left
    		const targets = dragTargetsRef.filter(target => rootRef && rootRef.contains(target));

    		// Make sure to remove a target present multiple times only once
    		// (Firefox may fire dragenter/dragleave multiple times on the same element)
    		const targetIdx = targets.indexOf(event.target);

    		if (targetIdx !== -1) {
    			targets.splice(targetIdx, 1);
    		}

    		dragTargetsRef = targets;

    		if (targets.length > 0) {
    			return;
    		}

    		state.isDragActive = false;
    		state.draggedFiles = [];

    		if (isEvtWithFiles(event)) {
    			dispatch("dragleave", { dragEvent: event });
    		}
    	}

    	function onDropCb(event) {
    		event.preventDefault();
    		stopPropagation(event);
    		dragTargetsRef = [];

    		if (isEvtWithFiles(event)) {
    			Promise.resolve(getFilesFromEvent(event)).then(files => {
    				if (isPropagationStopped(event) && !noDragEventsBubbling) {
    					return;
    				}

    				const acceptedFiles = [];
    				const fileRejections = [];

    				files.forEach(file => {
    					const [accepted, acceptError] = fileAccepted(file, accept);
    					const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);

    					if (accepted && sizeMatch) {
    						acceptedFiles.push(file);
    					} else {
    						const errors = [acceptError, sizeError].filter(e => e);
    						fileRejections.push({ file, errors });
    					}
    				});

    				if (!multiple && acceptedFiles.length > 1) {
    					// Reject everything and empty accepted files
    					acceptedFiles.forEach(file => {
    						fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
    					});

    					acceptedFiles.splice(0);
    				}

    				state.acceptedFiles = acceptedFiles;
    				state.fileRejections = fileRejections;
    				dispatch("drop", { acceptedFiles, fileRejections, event });

    				if (fileRejections.length > 0) {
    					dispatch("droprejected", { fileRejections, event });
    				}

    				if (acceptedFiles.length > 0) {
    					dispatch("dropaccepted", { acceptedFiles, event });
    				}
    			});
    		}

    		resetState();
    	}

    	function composeHandler(fn) {
    		return disabled ? null : fn;
    	}

    	function composeKeyboardHandler(fn) {
    		return noKeyboard ? null : composeHandler(fn);
    	}

    	function composeDragHandler(fn) {
    		return noDrag ? null : composeHandler(fn);
    	}

    	function stopPropagation(event) {
    		if (noDragEventsBubbling) {
    			event.stopPropagation();
    		}
    	}

    	let dragTargetsRef = [];

    	function onDocumentDrop(event) {
    		if (rootRef && rootRef.contains(event.target)) {
    			// If we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
    			return;
    		}

    		event.preventDefault();
    		dragTargetsRef = [];
    	}

    	// Update file dialog active state when the window is focused on
    	function onWindowFocus() {
    		// Execute the timeout only if the file dialog is opened in the browser
    		if (state.isFileDialogActive) {
    			setTimeout(
    				() => {
    					if (inputRef) {
    						const { files } = inputRef;

    						if (!files.length) {
    							state.isFileDialogActive = false;
    							dispatch("filedialogcancel");
    						}
    					}
    				},
    				300
    			);
    		}
    	}

    	onMount(() => {
    		window.addEventListener("focus", onWindowFocus, false);

    		if (preventDropOnDocument) {
    			document.addEventListener("dragover", onDocumentDragOver, false);
    			document.addEventListener("drop", onDocumentDrop, false);
    		}
    	});

    	onDestroy(() => {
    		window.removeEventListener("focus", onWindowFocus, false);

    		if (preventDropOnDocument) {
    			document.removeEventListener("dragover", onDocumentDragOver);
    			document.removeEventListener("drop", onDocumentDrop);
    		}
    	});

    	const writable_props = [
    		'accept',
    		'disabled',
    		'getFilesFromEvent',
    		'maxSize',
    		'minSize',
    		'multiple',
    		'preventDropOnDocument',
    		'noClick',
    		'noKeyboard',
    		'noDrag',
    		'noDragEventsBubbling',
    		'containerClasses',
    		'containerStyles',
    		'disableDefaultStyles'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropzone> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputRef = $$value;
    			$$invalidate(6, inputRef);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			rootRef = $$value;
    			$$invalidate(5, rootRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('accept' in $$props) $$invalidate(0, accept = $$props.accept);
    		if ('disabled' in $$props) $$invalidate(18, disabled = $$props.disabled);
    		if ('getFilesFromEvent' in $$props) $$invalidate(19, getFilesFromEvent = $$props.getFilesFromEvent);
    		if ('maxSize' in $$props) $$invalidate(20, maxSize = $$props.maxSize);
    		if ('minSize' in $$props) $$invalidate(21, minSize = $$props.minSize);
    		if ('multiple' in $$props) $$invalidate(1, multiple = $$props.multiple);
    		if ('preventDropOnDocument' in $$props) $$invalidate(22, preventDropOnDocument = $$props.preventDropOnDocument);
    		if ('noClick' in $$props) $$invalidate(23, noClick = $$props.noClick);
    		if ('noKeyboard' in $$props) $$invalidate(24, noKeyboard = $$props.noKeyboard);
    		if ('noDrag' in $$props) $$invalidate(25, noDrag = $$props.noDrag);
    		if ('noDragEventsBubbling' in $$props) $$invalidate(26, noDragEventsBubbling = $$props.noDragEventsBubbling);
    		if ('containerClasses' in $$props) $$invalidate(2, containerClasses = $$props.containerClasses);
    		if ('containerStyles' in $$props) $$invalidate(3, containerStyles = $$props.containerStyles);
    		if ('disableDefaultStyles' in $$props) $$invalidate(4, disableDefaultStyles = $$props.disableDefaultStyles);
    		if ('$$scope' in $$props) $$invalidate(27, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fromEvent,
    		allFilesAccepted,
    		composeEventHandlers,
    		fileAccepted,
    		fileMatchSize,
    		isEvtWithFiles,
    		isIeOrEdge,
    		isPropagationStopped,
    		onDocumentDragOver,
    		TOO_MANY_FILES_REJECTION,
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		accept,
    		disabled,
    		getFilesFromEvent,
    		maxSize,
    		minSize,
    		multiple,
    		preventDropOnDocument,
    		noClick,
    		noKeyboard,
    		noDrag,
    		noDragEventsBubbling,
    		containerClasses,
    		containerStyles,
    		disableDefaultStyles,
    		dispatch,
    		state,
    		rootRef,
    		inputRef,
    		resetState,
    		openFileDialog,
    		onKeyDownCb,
    		onFocusCb,
    		onBlurCb,
    		onClickCb,
    		onDragEnterCb,
    		onDragOverCb,
    		onDragLeaveCb,
    		onDropCb,
    		composeHandler,
    		composeKeyboardHandler,
    		composeDragHandler,
    		stopPropagation,
    		dragTargetsRef,
    		onDocumentDrop,
    		onWindowFocus,
    		onInputElementClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('accept' in $$props) $$invalidate(0, accept = $$props.accept);
    		if ('disabled' in $$props) $$invalidate(18, disabled = $$props.disabled);
    		if ('getFilesFromEvent' in $$props) $$invalidate(19, getFilesFromEvent = $$props.getFilesFromEvent);
    		if ('maxSize' in $$props) $$invalidate(20, maxSize = $$props.maxSize);
    		if ('minSize' in $$props) $$invalidate(21, minSize = $$props.minSize);
    		if ('multiple' in $$props) $$invalidate(1, multiple = $$props.multiple);
    		if ('preventDropOnDocument' in $$props) $$invalidate(22, preventDropOnDocument = $$props.preventDropOnDocument);
    		if ('noClick' in $$props) $$invalidate(23, noClick = $$props.noClick);
    		if ('noKeyboard' in $$props) $$invalidate(24, noKeyboard = $$props.noKeyboard);
    		if ('noDrag' in $$props) $$invalidate(25, noDrag = $$props.noDrag);
    		if ('noDragEventsBubbling' in $$props) $$invalidate(26, noDragEventsBubbling = $$props.noDragEventsBubbling);
    		if ('containerClasses' in $$props) $$invalidate(2, containerClasses = $$props.containerClasses);
    		if ('containerStyles' in $$props) $$invalidate(3, containerStyles = $$props.containerStyles);
    		if ('disableDefaultStyles' in $$props) $$invalidate(4, disableDefaultStyles = $$props.disableDefaultStyles);
    		if ('state' in $$props) state = $$props.state;
    		if ('rootRef' in $$props) $$invalidate(5, rootRef = $$props.rootRef);
    		if ('inputRef' in $$props) $$invalidate(6, inputRef = $$props.inputRef);
    		if ('dragTargetsRef' in $$props) dragTargetsRef = $$props.dragTargetsRef;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		accept,
    		multiple,
    		containerClasses,
    		containerStyles,
    		disableDefaultStyles,
    		rootRef,
    		inputRef,
    		onKeyDownCb,
    		onFocusCb,
    		onBlurCb,
    		onClickCb,
    		onDragEnterCb,
    		onDragOverCb,
    		onDragLeaveCb,
    		onDropCb,
    		composeHandler,
    		composeKeyboardHandler,
    		composeDragHandler,
    		disabled,
    		getFilesFromEvent,
    		maxSize,
    		minSize,
    		preventDropOnDocument,
    		noClick,
    		noKeyboard,
    		noDrag,
    		noDragEventsBubbling,
    		$$scope,
    		slots,
    		input_binding,
    		div_binding
    	];
    }

    class Dropzone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				accept: 0,
    				disabled: 18,
    				getFilesFromEvent: 19,
    				maxSize: 20,
    				minSize: 21,
    				multiple: 1,
    				preventDropOnDocument: 22,
    				noClick: 23,
    				noKeyboard: 24,
    				noDrag: 25,
    				noDragEventsBubbling: 26,
    				containerClasses: 2,
    				containerStyles: 3,
    				disableDefaultStyles: 4
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropzone",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accept*/ ctx[0] === undefined && !('accept' in props)) {
    			console.warn("<Dropzone> was created without expected prop 'accept'");
    		}
    	}

    	get accept() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accept(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getFilesFromEvent() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getFilesFromEvent(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxSize() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxSize(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minSize() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minSize(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get preventDropOnDocument() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set preventDropOnDocument(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noClick() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noClick(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noKeyboard() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noKeyboard(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noDrag() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noDrag(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noDragEventsBubbling() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noDragEventsBubbling(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerClasses() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerClasses(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyles() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyles(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disableDefaultStyles() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disableDefaultStyles(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    // eslint-disable-next-line func-names
    var kindOf = (function(cache) {
      // eslint-disable-next-line func-names
      return function(thing) {
        var str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
      };
    })(Object.create(null));

    function kindOfTest(type) {
      type = type.toLowerCase();
      return function isKindOf(thing) {
        return kindOf(thing) === type;
      };
    }

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return Array.isArray(val);
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    var isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (kindOf(val) !== 'object') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    var isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    var isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} thing The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(thing) {
      var pattern = '[object FormData]';
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) ||
        toString.call(thing) === pattern ||
        (isFunction(thing.toString) && thing.toString() === pattern)
      );
    }

    /**
     * Determine if a value is a URLSearchParams object
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    var isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     */

    function inherits(constructor, superConstructor, props, descriptors) {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      props && Object.assign(constructor.prototype, props);
    }

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function} [filter]
     * @returns {Object}
     */

    function toFlatObject(sourceObj, destObj, filter) {
      var props;
      var i;
      var prop;
      var merged = {};

      destObj = destObj || {};

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if (!merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = Object.getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    }

    /*
     * determines whether a string ends with the characters of a specified string
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     * @returns {boolean}
     */
    function endsWith(str, searchString, position) {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      var lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }


    /**
     * Returns new array from array like object
     * @param {*} [thing]
     * @returns {Array}
     */
    function toArray(thing) {
      if (!thing) return null;
      var i = thing.length;
      if (isUndefined(i)) return null;
      var arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    }

    // eslint-disable-next-line func-names
    var isTypedArray = (function(TypedArray) {
      // eslint-disable-next-line func-names
      return function(thing) {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM,
      inherits: inherits,
      toFlatObject: toFlatObject,
      kindOf: kindOf,
      kindOfTest: kindOfTest,
      endsWith: endsWith,
      toArray: toArray,
      isTypedArray: isTypedArray,
      isFileList: isFileList
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);
      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    var prototype = AxiosError.prototype;
    var descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED'
    // eslint-disable-next-line func-names
    ].forEach(function(code) {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = function(error, code, config, request, response, customProps) {
      var axiosError = Object.create(prototype);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    var AxiosError_1 = AxiosError;

    var transitional = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    /**
     * Convert a data object to FormData
     * @param {Object} obj
     * @param {?Object} [formData]
     * @returns {Object}
     **/

    function toFormData(obj, formData) {
      // eslint-disable-next-line no-param-reassign
      formData = formData || new FormData();

      var stack = [];

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      function build(data, parentKey) {
        if (utils.isPlainObject(data) || utils.isArray(data)) {
          if (stack.indexOf(data) !== -1) {
            throw Error('Circular reference detected in ' + parentKey);
          }

          stack.push(data);

          utils.forEach(data, function each(value, key) {
            if (utils.isUndefined(value)) return;
            var fullKey = parentKey ? parentKey + '.' + key : key;
            var arr;

            if (value && !parentKey && typeof value === 'object') {
              if (utils.endsWith(key, '{}')) {
                // eslint-disable-next-line no-param-reassign
                value = JSON.stringify(value);
              } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
                // eslint-disable-next-line func-names
                arr.forEach(function(el) {
                  !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
                });
                return;
              }
            }

            build(value, fullKey);
          });

          stack.pop();
        } else {
          formData.append(parentKey, convertValue(data));
        }
      }

      build(obj);

      return formData;
    }

    var toFormData_1 = toFormData;

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError_1(
          'Request failed with status code ' + response.status,
          [AxiosError_1.ERR_BAD_REQUEST, AxiosError_1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function CanceledError(message) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError_1.call(this, message == null ? 'canceled' : message, AxiosError_1.ERR_CANCELED);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError_1, {
      __CANCEL__: true
    });

    var CanceledError_1 = CanceledError;

    var parseProtocol = function parseProtocol(url) {
      var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    };

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError_1('Request aborted', AxiosError_1.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError_1('Network Error', AxiosError_1.ERR_NETWORK, config, request, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional$1 = config.transitional || transitional;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError_1(
            timeoutErrorMessage,
            transitional$1.clarifyTimeoutError ? AxiosError_1.ETIMEDOUT : AxiosError_1.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new CanceledError_1() : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        var protocol = parseProtocol(fullPath);

        if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
          reject(new AxiosError_1('Unsupported protocol ' + protocol + ':', AxiosError_1.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData);
      });
    };

    // eslint-disable-next-line strict
    var _null = null;

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults = {

      transitional: transitional,

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }

        var isObjectPayload = utils.isObject(data);
        var contentType = headers && headers['Content-Type'];

        var isFileList;

        if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
          var _FormData = this.env && this.env.FormData;
          return toFormData_1(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
        } else if (isObjectPayload || contentType === 'application/json') {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError_1.from(e, AxiosError_1.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: _null
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      var context = this || defaults_1;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError_1();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'beforeRedirect': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data = {
      "version": "0.27.2"
    };

    var VERSION = data.version;


    var validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new AxiosError_1(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError_1.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError_1('options must be an object', AxiosError_1.ERR_BAD_OPTION_VALUE);
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError_1('option ' + opt + ' must be ' + result, AxiosError_1.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError_1('Unknown option ' + opt, AxiosError_1.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions: assertOptions,
      validators: validators$1
    };

    var validators = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      var fullPath = buildFullPath(config.baseURL, config.url);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method: method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url: url,
            data: data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios_1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;

      // eslint-disable-next-line func-names
      this.promise.then(function(cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function(onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Expose Cancel & CancelToken
    axios$1.CanceledError = CanceledError_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;
    axios$1.VERSION = data.version;
    axios$1.toFormData = toFormData_1;

    // Expose AxiosError class
    axios$1.AxiosError = AxiosError_1;

    // alias for CanceledError for backward compatibility
    axios$1.Cancel = axios$1.CanceledError;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    var css_248z$E = "";
    styleInject(css_248z$E);

    var css_248z$D = "";
    styleInject(css_248z$D);

    /* node_modules/svelte-loading-spinners/dist/Circle2.svelte generated by Svelte v3.48.0 */

    const file$c = "node_modules/svelte-loading-spinners/dist/Circle2.svelte";

    function create_fragment$d(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "circle svelte-1vclic6");
    			set_style(div, "--size", /*size*/ ctx[0] + /*unit*/ ctx[1]);
    			set_style(div, "--colorInner", /*colorInner*/ ctx[4]);
    			set_style(div, "--colorCenter", /*colorCenter*/ ctx[3]);
    			set_style(div, "--colorOuter", /*colorOuter*/ ctx[2]);
    			set_style(div, "--durationInner", /*durationInner*/ ctx[6]);
    			set_style(div, "--durationCenter", /*durationCenter*/ ctx[7]);
    			set_style(div, "--durationOuter", /*durationOuter*/ ctx[5]);
    			add_location(div, file$c, 56, 0, 1412);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size, unit*/ 3) {
    				set_style(div, "--size", /*size*/ ctx[0] + /*unit*/ ctx[1]);
    			}

    			if (dirty & /*colorInner*/ 16) {
    				set_style(div, "--colorInner", /*colorInner*/ ctx[4]);
    			}

    			if (dirty & /*colorCenter*/ 8) {
    				set_style(div, "--colorCenter", /*colorCenter*/ ctx[3]);
    			}

    			if (dirty & /*colorOuter*/ 4) {
    				set_style(div, "--colorOuter", /*colorOuter*/ ctx[2]);
    			}

    			if (dirty & /*durationInner*/ 64) {
    				set_style(div, "--durationInner", /*durationInner*/ ctx[6]);
    			}

    			if (dirty & /*durationCenter*/ 128) {
    				set_style(div, "--durationCenter", /*durationCenter*/ ctx[7]);
    			}

    			if (dirty & /*durationOuter*/ 32) {
    				set_style(div, "--durationOuter", /*durationOuter*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Circle2', slots, []);
    	let { size = "60" } = $$props;
    	let { unit = "px" } = $$props;
    	let { colorOuter = "#FF3E00" } = $$props;
    	let { colorCenter = "#40B3FF" } = $$props;
    	let { colorInner = "#676778" } = $$props;
    	let { durationMultiplier = 1 } = $$props;
    	let { durationOuter = `${durationMultiplier * 2}s` } = $$props;
    	let { durationInner = `${durationMultiplier * 1.5}s` } = $$props;
    	let { durationCenter = `${durationMultiplier * 3}s` } = $$props;

    	const writable_props = [
    		'size',
    		'unit',
    		'colorOuter',
    		'colorCenter',
    		'colorInner',
    		'durationMultiplier',
    		'durationOuter',
    		'durationInner',
    		'durationCenter'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Circle2> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('colorOuter' in $$props) $$invalidate(2, colorOuter = $$props.colorOuter);
    		if ('colorCenter' in $$props) $$invalidate(3, colorCenter = $$props.colorCenter);
    		if ('colorInner' in $$props) $$invalidate(4, colorInner = $$props.colorInner);
    		if ('durationMultiplier' in $$props) $$invalidate(8, durationMultiplier = $$props.durationMultiplier);
    		if ('durationOuter' in $$props) $$invalidate(5, durationOuter = $$props.durationOuter);
    		if ('durationInner' in $$props) $$invalidate(6, durationInner = $$props.durationInner);
    		if ('durationCenter' in $$props) $$invalidate(7, durationCenter = $$props.durationCenter);
    	};

    	$$self.$capture_state = () => ({
    		size,
    		unit,
    		colorOuter,
    		colorCenter,
    		colorInner,
    		durationMultiplier,
    		durationOuter,
    		durationInner,
    		durationCenter
    	});

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('colorOuter' in $$props) $$invalidate(2, colorOuter = $$props.colorOuter);
    		if ('colorCenter' in $$props) $$invalidate(3, colorCenter = $$props.colorCenter);
    		if ('colorInner' in $$props) $$invalidate(4, colorInner = $$props.colorInner);
    		if ('durationMultiplier' in $$props) $$invalidate(8, durationMultiplier = $$props.durationMultiplier);
    		if ('durationOuter' in $$props) $$invalidate(5, durationOuter = $$props.durationOuter);
    		if ('durationInner' in $$props) $$invalidate(6, durationInner = $$props.durationInner);
    		if ('durationCenter' in $$props) $$invalidate(7, durationCenter = $$props.durationCenter);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		size,
    		unit,
    		colorOuter,
    		colorCenter,
    		colorInner,
    		durationOuter,
    		durationInner,
    		durationCenter,
    		durationMultiplier
    	];
    }

    class Circle2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			size: 0,
    			unit: 1,
    			colorOuter: 2,
    			colorCenter: 3,
    			colorInner: 4,
    			durationMultiplier: 8,
    			durationOuter: 5,
    			durationInner: 6,
    			durationCenter: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Circle2",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get size() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorOuter() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorOuter(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorCenter() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorCenter(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorInner() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorInner(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get durationMultiplier() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set durationMultiplier(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get durationOuter() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set durationOuter(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get durationInner() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set durationInner(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get durationCenter() {
    		throw new Error("<Circle2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set durationCenter(value) {
    		throw new Error("<Circle2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$C = "";
    styleInject(css_248z$C);

    var css_248z$B = "";
    styleInject(css_248z$B);

    var css_248z$A = "";
    styleInject(css_248z$A);

    var css_248z$z = "";
    styleInject(css_248z$z);

    var css_248z$y = "";
    styleInject(css_248z$y);

    var css_248z$x = "";
    styleInject(css_248z$x);

    var css_248z$w = "";
    styleInject(css_248z$w);

    var css_248z$v = "";
    styleInject(css_248z$v);

    var css_248z$u = "";
    styleInject(css_248z$u);

    var css_248z$t = "";
    styleInject(css_248z$t);

    var css_248z$s = "";
    styleInject(css_248z$s);

    var css_248z$r = "";
    styleInject(css_248z$r);

    var css_248z$q = "";
    styleInject(css_248z$q);

    var css_248z$p = "";
    styleInject(css_248z$p);

    var css_248z$o = "";
    styleInject(css_248z$o);

    var css_248z$n = "";
    styleInject(css_248z$n);

    var css_248z$m = "";
    styleInject(css_248z$m);

    var css_248z$l = "";
    styleInject(css_248z$l);

    var css_248z$k = "";
    styleInject(css_248z$k);

    var css_248z$j = "";
    styleInject(css_248z$j);

    var css_248z$i = "";
    styleInject(css_248z$i);

    var css_248z$h = "";
    styleInject(css_248z$h);

    const parseNumber = parseFloat;

    function joinCss(obj, separator = ';') {
      let texts;
      if (Array.isArray(obj)) {
        texts = obj.filter((text) => text);
      } else {
        texts = [];
        for (const prop in obj) {
          if (obj[prop]) {
            texts.push(`${prop}:${obj[prop]}`);
          }
        }
      }
      return texts.join(separator);
    }

    function getStyles(style, size, pull, fw) {
      let float;
      let width;
      const height = '1em';
      let lineHeight;
      let fontSize;
      let textAlign;
      let verticalAlign = '-.125em';
      const overflow = 'visible';

      if (fw) {
        textAlign = 'center';
        width = '1.25em';
      }

      if (pull) {
        float = pull;
      }

      if (size) {
        if (size == 'lg') {
          fontSize = '1.33333em';
          lineHeight = '.75em';
          verticalAlign = '-.225em';
        } else if (size == 'xs') {
          fontSize = '.75em';
        } else if (size == 'sm') {
          fontSize = '.875em';
        } else {
          fontSize = size.replace('x', 'em');
        }
      }

      return joinCss([
        joinCss({
          float,
          width,
          height,
          'line-height': lineHeight,
          'font-size': fontSize,
          'text-align': textAlign,
          'vertical-align': verticalAlign,
          'transform-origin': 'center',
          overflow,
        }),
        style,
      ]);
    }

    function getTransform(
      scale,
      translateX,
      translateY,
      rotate,
      flip,
      translateTimes = 1,
      translateUnit = '',
      rotateUnit = '',
    ) {
      let flipX = 1;
      let flipY = 1;

      if (flip) {
        if (flip == 'horizontal') {
          flipX = -1;
        } else if (flip == 'vertical') {
          flipY = -1;
        } else {
          flipX = flipY = -1;
        }
      }

      return joinCss(
        [
          `translate(${parseNumber(translateX) * translateTimes}${translateUnit},${parseNumber(translateY) * translateTimes}${translateUnit})`,
          `scale(${flipX * parseNumber(scale)},${flipY * parseNumber(scale)})`,
          rotate && `rotate(${rotate}${rotateUnit})`,
        ],
        ' ',
      );
    }

    var css_248z$g = "";
    styleInject(css_248z$g);

    /* node_modules/svelte-fa/src/fa.svelte generated by Svelte v3.48.0 */
    const file$b = "node_modules/svelte-fa/src/fa.svelte";

    // (78:0) {#if i[4]}
    function create_if_block$7(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let g1_transform_value;
    	let g1_transform_origin_value;
    	let svg_class_value;
    	let svg_viewBox_value;

    	function select_block_type(ctx, dirty) {
    		if (typeof /*i*/ ctx[7][4] == 'string') return create_if_block_1$4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			if_block.c();
    			attr_dev(g0, "transform", /*transform*/ ctx[10]);
    			add_location(g0, file$b, 91, 6, 1469);
    			attr_dev(g1, "transform", g1_transform_value = `translate(${/*i*/ ctx[7][0] / 2} ${/*i*/ ctx[7][1] / 2})`);
    			attr_dev(g1, "transform-origin", g1_transform_origin_value = `${/*i*/ ctx[7][0] / 4} 0`);
    			add_location(g1, file$b, 87, 4, 1358);
    			attr_dev(svg, "id", /*id*/ ctx[0]);
    			attr_dev(svg, "class", svg_class_value = "" + (null_to_empty(/*c*/ ctx[8]) + " svelte-1cj2gr0"));
    			attr_dev(svg, "style", /*s*/ ctx[9]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = `0 0 ${/*i*/ ctx[7][0]} ${/*i*/ ctx[7][1]}`);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$b, 78, 2, 1195);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			if_block.m(g0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g0, null);
    				}
    			}

    			if (dirty & /*transform*/ 1024) {
    				attr_dev(g0, "transform", /*transform*/ ctx[10]);
    			}

    			if (dirty & /*i*/ 128 && g1_transform_value !== (g1_transform_value = `translate(${/*i*/ ctx[7][0] / 2} ${/*i*/ ctx[7][1] / 2})`)) {
    				attr_dev(g1, "transform", g1_transform_value);
    			}

    			if (dirty & /*i*/ 128 && g1_transform_origin_value !== (g1_transform_origin_value = `${/*i*/ ctx[7][0] / 4} 0`)) {
    				attr_dev(g1, "transform-origin", g1_transform_origin_value);
    			}

    			if (dirty & /*id*/ 1) {
    				attr_dev(svg, "id", /*id*/ ctx[0]);
    			}

    			if (dirty & /*c*/ 256 && svg_class_value !== (svg_class_value = "" + (null_to_empty(/*c*/ ctx[8]) + " svelte-1cj2gr0"))) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*s*/ 512) {
    				attr_dev(svg, "style", /*s*/ ctx[9]);
    			}

    			if (dirty & /*i*/ 128 && svg_viewBox_value !== (svg_viewBox_value = `0 0 ${/*i*/ ctx[7][0]} ${/*i*/ ctx[7][1]}`)) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(78:0) {#if i[4]}",
    		ctx
    	});

    	return block;
    }

    // (99:8) {:else}
    function create_else_block(ctx) {
    	let path0;
    	let path0_d_value;
    	let path0_fill_value;
    	let path0_fill_opacity_value;
    	let path0_transform_value;
    	let path1;
    	let path1_d_value;
    	let path1_fill_value;
    	let path1_fill_opacity_value;
    	let path1_transform_value;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", path0_d_value = /*i*/ ctx[7][4][0]);
    			attr_dev(path0, "fill", path0_fill_value = /*secondaryColor*/ ctx[3] || /*color*/ ctx[1] || 'currentColor');

    			attr_dev(path0, "fill-opacity", path0_fill_opacity_value = /*swapOpacity*/ ctx[6] != false
    			? /*primaryOpacity*/ ctx[4]
    			: /*secondaryOpacity*/ ctx[5]);

    			attr_dev(path0, "transform", path0_transform_value = `translate(${/*i*/ ctx[7][0] / -2} ${/*i*/ ctx[7][1] / -2})`);
    			add_location(path0, file$b, 99, 10, 1721);
    			attr_dev(path1, "d", path1_d_value = /*i*/ ctx[7][4][1]);
    			attr_dev(path1, "fill", path1_fill_value = /*primaryColor*/ ctx[2] || /*color*/ ctx[1] || 'currentColor');

    			attr_dev(path1, "fill-opacity", path1_fill_opacity_value = /*swapOpacity*/ ctx[6] != false
    			? /*secondaryOpacity*/ ctx[5]
    			: /*primaryOpacity*/ ctx[4]);

    			attr_dev(path1, "transform", path1_transform_value = `translate(${/*i*/ ctx[7][0] / -2} ${/*i*/ ctx[7][1] / -2})`);
    			add_location(path1, file$b, 105, 10, 1982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 128 && path0_d_value !== (path0_d_value = /*i*/ ctx[7][4][0])) {
    				attr_dev(path0, "d", path0_d_value);
    			}

    			if (dirty & /*secondaryColor, color*/ 10 && path0_fill_value !== (path0_fill_value = /*secondaryColor*/ ctx[3] || /*color*/ ctx[1] || 'currentColor')) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty & /*swapOpacity, primaryOpacity, secondaryOpacity*/ 112 && path0_fill_opacity_value !== (path0_fill_opacity_value = /*swapOpacity*/ ctx[6] != false
    			? /*primaryOpacity*/ ctx[4]
    			: /*secondaryOpacity*/ ctx[5])) {
    				attr_dev(path0, "fill-opacity", path0_fill_opacity_value);
    			}

    			if (dirty & /*i*/ 128 && path0_transform_value !== (path0_transform_value = `translate(${/*i*/ ctx[7][0] / -2} ${/*i*/ ctx[7][1] / -2})`)) {
    				attr_dev(path0, "transform", path0_transform_value);
    			}

    			if (dirty & /*i*/ 128 && path1_d_value !== (path1_d_value = /*i*/ ctx[7][4][1])) {
    				attr_dev(path1, "d", path1_d_value);
    			}

    			if (dirty & /*primaryColor, color*/ 6 && path1_fill_value !== (path1_fill_value = /*primaryColor*/ ctx[2] || /*color*/ ctx[1] || 'currentColor')) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty & /*swapOpacity, secondaryOpacity, primaryOpacity*/ 112 && path1_fill_opacity_value !== (path1_fill_opacity_value = /*swapOpacity*/ ctx[6] != false
    			? /*secondaryOpacity*/ ctx[5]
    			: /*primaryOpacity*/ ctx[4])) {
    				attr_dev(path1, "fill-opacity", path1_fill_opacity_value);
    			}

    			if (dirty & /*i*/ 128 && path1_transform_value !== (path1_transform_value = `translate(${/*i*/ ctx[7][0] / -2} ${/*i*/ ctx[7][1] / -2})`)) {
    				attr_dev(path1, "transform", path1_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(99:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (93:8) {#if typeof i[4] == 'string'}
    function create_if_block_1$4(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let path_transform_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*i*/ ctx[7][4]);
    			attr_dev(path, "fill", path_fill_value = /*color*/ ctx[1] || /*primaryColor*/ ctx[2] || 'currentColor');
    			attr_dev(path, "transform", path_transform_value = `translate(${/*i*/ ctx[7][0] / -2} ${/*i*/ ctx[7][1] / -2})`);
    			add_location(path, file$b, 93, 10, 1533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 128 && path_d_value !== (path_d_value = /*i*/ ctx[7][4])) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*color, primaryColor*/ 6 && path_fill_value !== (path_fill_value = /*color*/ ctx[1] || /*primaryColor*/ ctx[2] || 'currentColor')) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*i*/ 128 && path_transform_value !== (path_transform_value = `translate(${/*i*/ ctx[7][0] / -2} ${/*i*/ ctx[7][1] / -2})`)) {
    				attr_dev(path, "transform", path_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(93:8) {#if typeof i[4] == 'string'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let if_block = /*i*/ ctx[7][4] && create_if_block$7(ctx);

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
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*i*/ ctx[7][4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fa', slots, []);
    	let { class: clazz = '' } = $$props;
    	let { id = '' } = $$props;
    	let { style = '' } = $$props;
    	let { icon } = $$props;
    	let { size = '' } = $$props;
    	let { color = '' } = $$props;
    	let { fw = false } = $$props;
    	let { pull = '' } = $$props;
    	let { scale = 1 } = $$props;
    	let { translateX = 0 } = $$props;
    	let { translateY = 0 } = $$props;
    	let { rotate = '' } = $$props;
    	let { flip = false } = $$props;
    	let { spin = false } = $$props;
    	let { pulse = false } = $$props;
    	let { primaryColor = '' } = $$props;
    	let { secondaryColor = '' } = $$props;
    	let { primaryOpacity = 1 } = $$props;
    	let { secondaryOpacity = 0.4 } = $$props;
    	let { swapOpacity = false } = $$props;
    	let i;
    	let c;
    	let s;
    	let transform;

    	const writable_props = [
    		'class',
    		'id',
    		'style',
    		'icon',
    		'size',
    		'color',
    		'fw',
    		'pull',
    		'scale',
    		'translateX',
    		'translateY',
    		'rotate',
    		'flip',
    		'spin',
    		'pulse',
    		'primaryColor',
    		'secondaryColor',
    		'primaryOpacity',
    		'secondaryOpacity',
    		'swapOpacity'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fa> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(11, clazz = $$props.class);
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('style' in $$props) $$invalidate(12, style = $$props.style);
    		if ('icon' in $$props) $$invalidate(13, icon = $$props.icon);
    		if ('size' in $$props) $$invalidate(14, size = $$props.size);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('fw' in $$props) $$invalidate(15, fw = $$props.fw);
    		if ('pull' in $$props) $$invalidate(16, pull = $$props.pull);
    		if ('scale' in $$props) $$invalidate(17, scale = $$props.scale);
    		if ('translateX' in $$props) $$invalidate(18, translateX = $$props.translateX);
    		if ('translateY' in $$props) $$invalidate(19, translateY = $$props.translateY);
    		if ('rotate' in $$props) $$invalidate(20, rotate = $$props.rotate);
    		if ('flip' in $$props) $$invalidate(21, flip = $$props.flip);
    		if ('spin' in $$props) $$invalidate(22, spin = $$props.spin);
    		if ('pulse' in $$props) $$invalidate(23, pulse = $$props.pulse);
    		if ('primaryColor' in $$props) $$invalidate(2, primaryColor = $$props.primaryColor);
    		if ('secondaryColor' in $$props) $$invalidate(3, secondaryColor = $$props.secondaryColor);
    		if ('primaryOpacity' in $$props) $$invalidate(4, primaryOpacity = $$props.primaryOpacity);
    		if ('secondaryOpacity' in $$props) $$invalidate(5, secondaryOpacity = $$props.secondaryOpacity);
    		if ('swapOpacity' in $$props) $$invalidate(6, swapOpacity = $$props.swapOpacity);
    	};

    	$$self.$capture_state = () => ({
    		joinCss,
    		getStyles,
    		getTransform,
    		clazz,
    		id,
    		style,
    		icon,
    		size,
    		color,
    		fw,
    		pull,
    		scale,
    		translateX,
    		translateY,
    		rotate,
    		flip,
    		spin,
    		pulse,
    		primaryColor,
    		secondaryColor,
    		primaryOpacity,
    		secondaryOpacity,
    		swapOpacity,
    		i,
    		c,
    		s,
    		transform
    	});

    	$$self.$inject_state = $$props => {
    		if ('clazz' in $$props) $$invalidate(11, clazz = $$props.clazz);
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('style' in $$props) $$invalidate(12, style = $$props.style);
    		if ('icon' in $$props) $$invalidate(13, icon = $$props.icon);
    		if ('size' in $$props) $$invalidate(14, size = $$props.size);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('fw' in $$props) $$invalidate(15, fw = $$props.fw);
    		if ('pull' in $$props) $$invalidate(16, pull = $$props.pull);
    		if ('scale' in $$props) $$invalidate(17, scale = $$props.scale);
    		if ('translateX' in $$props) $$invalidate(18, translateX = $$props.translateX);
    		if ('translateY' in $$props) $$invalidate(19, translateY = $$props.translateY);
    		if ('rotate' in $$props) $$invalidate(20, rotate = $$props.rotate);
    		if ('flip' in $$props) $$invalidate(21, flip = $$props.flip);
    		if ('spin' in $$props) $$invalidate(22, spin = $$props.spin);
    		if ('pulse' in $$props) $$invalidate(23, pulse = $$props.pulse);
    		if ('primaryColor' in $$props) $$invalidate(2, primaryColor = $$props.primaryColor);
    		if ('secondaryColor' in $$props) $$invalidate(3, secondaryColor = $$props.secondaryColor);
    		if ('primaryOpacity' in $$props) $$invalidate(4, primaryOpacity = $$props.primaryOpacity);
    		if ('secondaryOpacity' in $$props) $$invalidate(5, secondaryOpacity = $$props.secondaryOpacity);
    		if ('swapOpacity' in $$props) $$invalidate(6, swapOpacity = $$props.swapOpacity);
    		if ('i' in $$props) $$invalidate(7, i = $$props.i);
    		if ('c' in $$props) $$invalidate(8, c = $$props.c);
    		if ('s' in $$props) $$invalidate(9, s = $$props.s);
    		if ('transform' in $$props) $$invalidate(10, transform = $$props.transform);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 8192) {
    			$$invalidate(7, i = icon && icon.icon || [0, 0, '', [], '']);
    		}

    		if ($$self.$$.dirty & /*clazz, spin, pulse*/ 12584960) {
    			$$invalidate(8, c = joinCss([clazz, 'svelte-fa', spin && 'spin', pulse && 'pulse'], ' '));
    		}

    		if ($$self.$$.dirty & /*style, size, pull, fw*/ 118784) {
    			$$invalidate(9, s = getStyles(style, size, pull, fw));
    		}

    		if ($$self.$$.dirty & /*scale, translateX, translateY, rotate, flip*/ 4063232) {
    			$$invalidate(10, transform = getTransform(scale, translateX, translateY, rotate, flip, 512));
    		}
    	};

    	return [
    		id,
    		color,
    		primaryColor,
    		secondaryColor,
    		primaryOpacity,
    		secondaryOpacity,
    		swapOpacity,
    		i,
    		c,
    		s,
    		transform,
    		clazz,
    		style,
    		icon,
    		size,
    		fw,
    		pull,
    		scale,
    		translateX,
    		translateY,
    		rotate,
    		flip,
    		spin,
    		pulse
    	];
    }

    class Fa extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			class: 11,
    			id: 0,
    			style: 12,
    			icon: 13,
    			size: 14,
    			color: 1,
    			fw: 15,
    			pull: 16,
    			scale: 17,
    			translateX: 18,
    			translateY: 19,
    			rotate: 20,
    			flip: 21,
    			spin: 22,
    			pulse: 23,
    			primaryColor: 2,
    			secondaryColor: 3,
    			primaryOpacity: 4,
    			secondaryOpacity: 5,
    			swapOpacity: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fa",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[13] === undefined && !('icon' in props)) {
    			console.warn("<Fa> was created without expected prop 'icon'");
    		}
    	}

    	get class() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fw() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fw(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pull() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pull(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get translateX() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translateX(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get translateY() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translateY(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flip() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pulse() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pulse(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryColor() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryColor(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryColor() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryColor(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get swapOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set swapOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*!
     * Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com
     * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
     * Copyright 2022 Fonticons, Inc.
     */
    var faFile = {
      prefix: 'fas',
      iconName: 'file',
      icon: [384, 512, [128459, 61462, 128196], "f15b", "M0 64C0 28.65 28.65 0 64 0H224V128C224 145.7 238.3 160 256 160H384V448C384 483.3 355.3 512 320 512H64C28.65 512 0 483.3 0 448V64zM256 128V0L384 128H256z"]
    };

    var css_248z$f = "";
    styleInject(css_248z$f);

    /* node_modules/svelma/src/components/Icon.svelte generated by Svelte v3.48.0 */

    const file$a = "node_modules/svelma/src/components/Icon.svelte";

    function create_fragment$b(ctx) {
    	let span;
    	let i;
    	let i_class_value;
    	let span_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "" + (/*newPack*/ ctx[8] + " fa-" + /*icon*/ ctx[0] + " " + /*customClass*/ ctx[2] + " " + /*newCustomSize*/ ctx[6]));
    			add_location(i, file$a, 53, 2, 1189);
    			attr_dev(span, "class", span_class_value = "icon " + /*size*/ ctx[1] + " " + /*newType*/ ctx[7] + " " + (/*isLeft*/ ctx[4] && 'is-left' || '') + " " + (/*isRight*/ ctx[5] && 'is-right' || ''));
    			toggle_class(span, "is-clickable", /*isClickable*/ ctx[3]);
    			add_location(span, file$a, 52, 0, 1046);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*newPack, icon, customClass, newCustomSize*/ 325 && i_class_value !== (i_class_value = "" + (/*newPack*/ ctx[8] + " fa-" + /*icon*/ ctx[0] + " " + /*customClass*/ ctx[2] + " " + /*newCustomSize*/ ctx[6]))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*size, newType, isLeft, isRight*/ 178 && span_class_value !== (span_class_value = "icon " + /*size*/ ctx[1] + " " + /*newType*/ ctx[7] + " " + (/*isLeft*/ ctx[4] && 'is-left' || '') + " " + (/*isRight*/ ctx[5] && 'is-right' || ''))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*size, newType, isLeft, isRight, isClickable*/ 186) {
    				toggle_class(span, "is-clickable", /*isClickable*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
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
    	let newPack;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { type = '' } = $$props;
    	let { pack = 'fas' } = $$props;
    	let { icon } = $$props;
    	let { size = '' } = $$props;
    	let { customClass = '' } = $$props;
    	let { customSize = '' } = $$props;
    	let { isClickable = false } = $$props;
    	let { isLeft = false } = $$props;
    	let { isRight = false } = $$props;
    	let newCustomSize = '';
    	let newType = '';

    	const writable_props = [
    		'type',
    		'pack',
    		'icon',
    		'size',
    		'customClass',
    		'customSize',
    		'isClickable',
    		'isLeft',
    		'isRight'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(9, type = $$props.type);
    		if ('pack' in $$props) $$invalidate(10, pack = $$props.pack);
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    		if ('customClass' in $$props) $$invalidate(2, customClass = $$props.customClass);
    		if ('customSize' in $$props) $$invalidate(11, customSize = $$props.customSize);
    		if ('isClickable' in $$props) $$invalidate(3, isClickable = $$props.isClickable);
    		if ('isLeft' in $$props) $$invalidate(4, isLeft = $$props.isLeft);
    		if ('isRight' in $$props) $$invalidate(5, isRight = $$props.isRight);
    	};

    	$$self.$capture_state = () => ({
    		type,
    		pack,
    		icon,
    		size,
    		customClass,
    		customSize,
    		isClickable,
    		isLeft,
    		isRight,
    		newCustomSize,
    		newType,
    		newPack
    	});

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(9, type = $$props.type);
    		if ('pack' in $$props) $$invalidate(10, pack = $$props.pack);
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    		if ('customClass' in $$props) $$invalidate(2, customClass = $$props.customClass);
    		if ('customSize' in $$props) $$invalidate(11, customSize = $$props.customSize);
    		if ('isClickable' in $$props) $$invalidate(3, isClickable = $$props.isClickable);
    		if ('isLeft' in $$props) $$invalidate(4, isLeft = $$props.isLeft);
    		if ('isRight' in $$props) $$invalidate(5, isRight = $$props.isRight);
    		if ('newCustomSize' in $$props) $$invalidate(6, newCustomSize = $$props.newCustomSize);
    		if ('newType' in $$props) $$invalidate(7, newType = $$props.newType);
    		if ('newPack' in $$props) $$invalidate(8, newPack = $$props.newPack);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*pack*/ 1024) {
    			$$invalidate(8, newPack = pack || 'fas');
    		}

    		if ($$self.$$.dirty & /*customSize, size*/ 2050) {
    			{
    				if (customSize) $$invalidate(6, newCustomSize = customSize); else {
    					switch (size) {
    						case 'is-small':
    							break;
    						case 'is-medium':
    							$$invalidate(6, newCustomSize = 'fa-lg');
    							break;
    						case 'is-large':
    							$$invalidate(6, newCustomSize = 'fa-3x');
    							break;
    						default:
    							$$invalidate(6, newCustomSize = '');
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*type*/ 512) {
    			{
    				if (!type) $$invalidate(7, newType = '');
    				let splitType = [];

    				if (typeof type === 'string') {
    					splitType = type.split('-');
    				} else {
    					for (let key in type) {
    						if (type[key]) {
    							splitType = key.split('-');
    							break;
    						}
    					}
    				}

    				if (splitType.length <= 1) $$invalidate(7, newType = ''); else $$invalidate(7, newType = `has-text-${splitType[1]}`);
    			}
    		}
    	};

    	return [
    		icon,
    		size,
    		customClass,
    		isClickable,
    		isLeft,
    		isRight,
    		newCustomSize,
    		newType,
    		newPack,
    		type,
    		pack,
    		customSize,
    		click_handler
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			type: 9,
    			pack: 10,
    			icon: 0,
    			size: 1,
    			customClass: 2,
    			customSize: 11,
    			isClickable: 3,
    			isLeft: 4,
    			isRight: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !('icon' in props)) {
    			console.warn("<Icon> was created without expected prop 'icon'");
    		}
    	}

    	get type() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pack() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pack(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customClass() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customClass(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customSize() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customSize(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isClickable() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isClickable(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLeft() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLeft(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRight() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRight(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
        let len = node.getTotalLength();
        const style = getComputedStyle(node);
        if (style.strokeLinecap !== 'butt') {
            len += parseInt(style.strokeWidth);
        }
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    var transitions = /*#__PURE__*/Object.freeze({
        __proto__: null,
        blur: blur,
        crossfade: crossfade,
        draw: draw,
        fade: fade,
        fly: fly,
        scale: scale,
        slide: slide
    });

    function chooseAnimation(animation) {
      return typeof animation === 'function' ? animation : transitions[animation]
    }

    function isEnterKey(e) {
      return e.keyCode && e.keyCode === 13
    }

    function isEscKey(e) {
      return e.keyCode && e.keyCode === 27
    }

    function omit(obj, ...keysToOmit) {
      return Object.keys(obj).reduce((acc, key) => {
        if (keysToOmit.indexOf(key) === -1) acc[key] = obj[key];
        return acc
      }, {})
    }

    function typeToIcon(type) {
      switch (type) {
        case 'is-info':
          return 'info-circle'
        case 'is-success':
          return 'check-circle'
        case 'is-warning':
          return 'exclamation-triangle'
        case 'is-danger':
          return 'exclamation-circle'
        default:
          return null
      }
    }

    /* node_modules/svelma/src/components/Button.svelte generated by Svelte v3.48.0 */

    const { Error: Error_1$1 } = globals;
    const file$9 = "node_modules/svelma/src/components/Button.svelte";

    // (85:22) 
    function create_if_block_3$1(ctx) {
    	let a;
    	let t0;
    	let span;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*iconLeft*/ ctx[7] && create_if_block_5(ctx);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	let if_block1 = /*iconRight*/ ctx[8] && create_if_block_4$1(ctx);
    	let a_levels = [{ href: /*href*/ ctx[1] }, /*props*/ ctx[11]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			add_location(span, file$9, 96, 4, 2314);
    			set_attributes(a, a_data);
    			toggle_class(a, "is-inverted", /*inverted*/ ctx[4]);
    			toggle_class(a, "is-loading", /*loading*/ ctx[3]);
    			toggle_class(a, "is-outlined", /*outlined*/ ctx[5]);
    			toggle_class(a, "is-rounded", /*rounded*/ ctx[6]);
    			add_location(a, file$9, 85, 2, 2047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block0) if_block0.m(a, null);
    			append_dev(a, t0);
    			append_dev(a, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(a, t1);
    			if (if_block1) if_block1.m(a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_1*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*iconLeft*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*iconLeft*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(a, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*iconRight*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*iconRight*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(a, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
    				dirty & /*props*/ 2048 && /*props*/ ctx[11]
    			]));

    			toggle_class(a, "is-inverted", /*inverted*/ ctx[4]);
    			toggle_class(a, "is-loading", /*loading*/ ctx[3]);
    			toggle_class(a, "is-outlined", /*outlined*/ ctx[5]);
    			toggle_class(a, "is-rounded", /*rounded*/ ctx[6]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(85:22) ",
    		ctx
    	});

    	return block;
    }

    // (66:0) {#if tag === 'button'}
    function create_if_block$6(ctx) {
    	let button;
    	let t0;
    	let span;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*iconLeft*/ ctx[7] && create_if_block_2$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	let if_block1 = /*iconRight*/ ctx[8] && create_if_block_1$3(ctx);
    	let button_levels = [/*props*/ ctx[11], { type: /*nativeType*/ ctx[2] }];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			add_location(span, file$9, 77, 4, 1882);
    			set_attributes(button, button_data);
    			toggle_class(button, "is-inverted", /*inverted*/ ctx[4]);
    			toggle_class(button, "is-loading", /*loading*/ ctx[3]);
    			toggle_class(button, "is-outlined", /*outlined*/ ctx[5]);
    			toggle_class(button, "is-rounded", /*rounded*/ ctx[6]);
    			add_location(button, file$9, 66, 2, 1599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);
    			append_dev(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(button, t1);
    			if (if_block1) if_block1.m(button, null);
    			if (button.autofocus) button.focus();
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[16], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*iconLeft*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*iconLeft*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(button, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*iconRight*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*iconRight*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(button, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				dirty & /*props*/ 2048 && /*props*/ ctx[11],
    				(!current || dirty & /*nativeType*/ 4) && { type: /*nativeType*/ ctx[2] }
    			]));

    			toggle_class(button, "is-inverted", /*inverted*/ ctx[4]);
    			toggle_class(button, "is-loading", /*loading*/ ctx[3]);
    			toggle_class(button, "is-outlined", /*outlined*/ ctx[5]);
    			toggle_class(button, "is-rounded", /*rounded*/ ctx[6]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(66:0) {#if tag === 'button'}",
    		ctx
    	});

    	return block;
    }

    // (94:4) {#if iconLeft}
    function create_if_block_5(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				icon: /*iconLeft*/ ctx[7],
    				size: /*iconSize*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconPack*/ 512) icon_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty & /*iconLeft*/ 128) icon_changes.icon = /*iconLeft*/ ctx[7];
    			if (dirty & /*iconSize*/ 1024) icon_changes.size = /*iconSize*/ ctx[10];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(94:4) {#if iconLeft}",
    		ctx
    	});

    	return block;
    }

    // (100:4) {#if iconRight}
    function create_if_block_4$1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				icon: /*iconRight*/ ctx[8],
    				size: /*iconSize*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconPack*/ 512) icon_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty & /*iconRight*/ 256) icon_changes.icon = /*iconRight*/ ctx[8];
    			if (dirty & /*iconSize*/ 1024) icon_changes.size = /*iconSize*/ ctx[10];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(100:4) {#if iconRight}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if iconLeft}
    function create_if_block_2$2(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				icon: /*iconLeft*/ ctx[7],
    				size: /*iconSize*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconPack*/ 512) icon_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty & /*iconLeft*/ 128) icon_changes.icon = /*iconLeft*/ ctx[7];
    			if (dirty & /*iconSize*/ 1024) icon_changes.size = /*iconSize*/ ctx[10];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(75:4) {#if iconLeft}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if iconRight}
    function create_if_block_1$3(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				icon: /*iconRight*/ ctx[8],
    				size: /*iconSize*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconPack*/ 512) icon_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty & /*iconRight*/ 256) icon_changes.icon = /*iconRight*/ ctx[8];
    			if (dirty & /*iconSize*/ 1024) icon_changes.size = /*iconSize*/ ctx[10];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(81:4) {#if iconRight}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[0] === 'button') return 0;
    		if (/*tag*/ ctx[0] === 'a') return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
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
    	let props;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { tag = 'button' } = $$props;
    	let { type = '' } = $$props;
    	let { size = '' } = $$props;
    	let { href = '' } = $$props;
    	let { nativeType = 'button' } = $$props;
    	let { loading = false } = $$props;
    	let { inverted = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { iconLeft = null } = $$props;
    	let { iconRight = null } = $$props;
    	let { iconPack = null } = $$props;
    	let iconSize = '';

    	onMount(() => {
    		if (!['button', 'a'].includes(tag)) throw new Error(`'${tag}' cannot be used as a tag for a Bulma button`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('tag' in $$new_props) $$invalidate(0, tag = $$new_props.tag);
    		if ('type' in $$new_props) $$invalidate(12, type = $$new_props.type);
    		if ('size' in $$new_props) $$invalidate(13, size = $$new_props.size);
    		if ('href' in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ('nativeType' in $$new_props) $$invalidate(2, nativeType = $$new_props.nativeType);
    		if ('loading' in $$new_props) $$invalidate(3, loading = $$new_props.loading);
    		if ('inverted' in $$new_props) $$invalidate(4, inverted = $$new_props.inverted);
    		if ('outlined' in $$new_props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ('rounded' in $$new_props) $$invalidate(6, rounded = $$new_props.rounded);
    		if ('iconLeft' in $$new_props) $$invalidate(7, iconLeft = $$new_props.iconLeft);
    		if ('iconRight' in $$new_props) $$invalidate(8, iconRight = $$new_props.iconRight);
    		if ('iconPack' in $$new_props) $$invalidate(9, iconPack = $$new_props.iconPack);
    		if ('$$scope' in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Icon,
    		omit,
    		tag,
    		type,
    		size,
    		href,
    		nativeType,
    		loading,
    		inverted,
    		outlined,
    		rounded,
    		iconLeft,
    		iconRight,
    		iconPack,
    		iconSize,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ('tag' in $$props) $$invalidate(0, tag = $$new_props.tag);
    		if ('type' in $$props) $$invalidate(12, type = $$new_props.type);
    		if ('size' in $$props) $$invalidate(13, size = $$new_props.size);
    		if ('href' in $$props) $$invalidate(1, href = $$new_props.href);
    		if ('nativeType' in $$props) $$invalidate(2, nativeType = $$new_props.nativeType);
    		if ('loading' in $$props) $$invalidate(3, loading = $$new_props.loading);
    		if ('inverted' in $$props) $$invalidate(4, inverted = $$new_props.inverted);
    		if ('outlined' in $$props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ('rounded' in $$props) $$invalidate(6, rounded = $$new_props.rounded);
    		if ('iconLeft' in $$props) $$invalidate(7, iconLeft = $$new_props.iconLeft);
    		if ('iconRight' in $$props) $$invalidate(8, iconRight = $$new_props.iconRight);
    		if ('iconPack' in $$props) $$invalidate(9, iconPack = $$new_props.iconPack);
    		if ('iconSize' in $$props) $$invalidate(10, iconSize = $$new_props.iconSize);
    		if ('props' in $$props) $$invalidate(11, props = $$new_props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(11, props = {
    			...omit($$props, 'loading', 'inverted', 'nativeType', 'outlined', 'rounded', 'type'),
    			class: `button ${type} ${size} ${$$props.class || ''}`
    		});

    		if ($$self.$$.dirty & /*size*/ 8192) {
    			{
    				if (!size || size === 'is-medium') {
    					$$invalidate(10, iconSize = 'is-small');
    				} else if (size === 'is-large') {
    					$$invalidate(10, iconSize = 'is-medium');
    				} else {
    					$$invalidate(10, iconSize = size);
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		tag,
    		href,
    		nativeType,
    		loading,
    		inverted,
    		outlined,
    		rounded,
    		iconLeft,
    		iconRight,
    		iconPack,
    		iconSize,
    		props,
    		type,
    		size,
    		$$scope,
    		slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			tag: 0,
    			type: 12,
    			size: 13,
    			href: 1,
    			nativeType: 2,
    			loading: 3,
    			inverted: 4,
    			outlined: 5,
    			rounded: 6,
    			iconLeft: 7,
    			iconRight: 8,
    			iconPack: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get tag() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nativeType() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nativeType(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverted() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverted(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconLeft() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconLeft(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconRight() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconRight(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconPack() {
    		throw new Error_1$1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconPack(value) {
    		throw new Error_1$1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$e = "";
    styleInject(css_248z$e);

    /* node_modules/svelma/src/components/Dialog/Dialog.svelte generated by Svelte v3.48.0 */
    const file$8 = "node_modules/svelma/src/components/Dialog/Dialog.svelte";

    // (199:0) {#if active}
    function create_if_block$5(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let t1;
    	let section;
    	let div2;
    	let t2;
    	let div1;
    	let p;
    	let t3;
    	let t4;
    	let footer;
    	let t5;
    	let button;
    	let t6;
    	let button_class_value;
    	let div3_transition;
    	let div4_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*title*/ ctx[2] && create_if_block_4(ctx);
    	let if_block1 = /*icon*/ ctx[6] && create_if_block_3(ctx);
    	let if_block2 = /*hasInput*/ ctx[8] && create_if_block_2$1(ctx);
    	let if_block3 = /*showCancel*/ ctx[9] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			section = element("section");
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			footer = element("footer");
    			if (if_block3) if_block3.c();
    			t5 = space();
    			button = element("button");
    			t6 = text(/*confirmText*/ ctx[4]);
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file$8, 200, 4, 4924);
    			add_location(p, file$8, 219, 12, 5699);
    			attr_dev(div1, "class", "media-content");
    			add_location(div1, file$8, 218, 10, 5659);
    			attr_dev(div2, "class", "media");
    			add_location(div2, file$8, 212, 8, 5462);
    			attr_dev(section, "class", "modal-card-body svelte-1gwiwqo");
    			toggle_class(section, "is-titleless", !/*title*/ ctx[2]);
    			toggle_class(section, "is-flex", /*icon*/ ctx[6]);
    			add_location(section, file$8, 211, 6, 5371);
    			attr_dev(button, "class", button_class_value = "button " + /*type*/ ctx[11] + " svelte-1gwiwqo");
    			add_location(button, file$8, 247, 8, 6504);
    			attr_dev(footer, "class", "modal-card-foot svelte-1gwiwqo");
    			add_location(footer, file$8, 238, 6, 6258);
    			attr_dev(div3, "class", "modal-card svelte-1gwiwqo");
    			add_location(div3, file$8, 201, 4, 4982);
    			attr_dev(div4, "class", div4_class_value = "modal dialog " + /*size*/ ctx[10] + " is-active" + " svelte-1gwiwqo");
    			add_location(div4, file$8, 199, 2, 4858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t1);
    			append_dev(div3, section);
    			append_dev(section, div2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			p.innerHTML = /*message*/ ctx[3];
    			append_dev(div1, t3);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div3, t4);
    			append_dev(div3, footer);
    			if (if_block3) if_block3.m(footer, null);
    			append_dev(footer, t5);
    			append_dev(footer, button);
    			append_dev(button, t6);
    			/*button_binding_1*/ ctx[32](button);
    			/*div4_binding*/ ctx[33](div4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*close*/ ctx[21], false, false, false),
    					listen_dev(button, "click", /*confirm*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*title*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div3, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*icon*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*message*/ 8) p.innerHTML = /*message*/ ctx[3];
    			if (/*hasInput*/ ctx[8]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*title*/ 4) {
    				toggle_class(section, "is-titleless", !/*title*/ ctx[2]);
    			}

    			if (dirty[0] & /*icon*/ 64) {
    				toggle_class(section, "is-flex", /*icon*/ ctx[6]);
    			}

    			if (/*showCancel*/ ctx[9]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1$2(ctx);
    					if_block3.c();
    					if_block3.m(footer, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (!current || dirty[0] & /*confirmText*/ 16) set_data_dev(t6, /*confirmText*/ ctx[4]);

    			if (!current || dirty[0] & /*type*/ 2048 && button_class_value !== (button_class_value = "button " + /*type*/ ctx[11] + " svelte-1gwiwqo")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty[0] & /*size*/ 1024 && div4_class_value !== (div4_class_value = "modal dialog " + /*size*/ ctx[10] + " is-active" + " svelte-1gwiwqo")) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*_animation*/ ctx[19], /*animProps*/ ctx[12], true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*_animation*/ ctx[19], /*animProps*/ ctx[12], false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			/*button_binding_1*/ ctx[32](null);
    			if (detaching && div3_transition) div3_transition.end();
    			/*div4_binding*/ ctx[33](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(199:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (203:6) {#if title}
    function create_if_block_4(ctx) {
    	let header;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			header = element("header");
    			p = element("p");
    			t = text(/*title*/ ctx[2]);
    			attr_dev(p, "class", "modal-card-title");
    			add_location(p, file$8, 204, 10, 5110);
    			attr_dev(header, "class", "modal-card-head svelte-1gwiwqo");
    			add_location(header, file$8, 203, 8, 5067);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(203:6) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (214:10) {#if icon}
    function create_if_block_3(ctx) {
    	let div;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[7],
    				icon: /*icon*/ ctx[6],
    				type: /*type*/ ctx[11],
    				size: "is-large"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icon_1.$$.fragment);
    			attr_dev(div, "class", "media-left");
    			add_location(div, file$8, 214, 12, 5515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iconPack*/ 128) icon_1_changes.pack = /*iconPack*/ ctx[7];
    			if (dirty[0] & /*icon*/ 64) icon_1_changes.icon = /*icon*/ ctx[6];
    			if (dirty[0] & /*type*/ 2048) icon_1_changes.type = /*type*/ ctx[11];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(214:10) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (222:12) {#if hasInput}
    function create_if_block_2$1(ctx) {
    	let div1;
    	let div0;
    	let input_1;
    	let t0;
    	let p;
    	let t1;
    	let mounted;
    	let dispose;
    	let input_1_levels = [{ class: "input" }, /*newInputProps*/ ctx[18]];
    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			input_1 = element("input");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*validationMessage*/ ctx[17]);
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-1gwiwqo", true);
    			add_location(input_1, file$8, 224, 18, 5840);
    			attr_dev(p, "class", "help is-danger");
    			add_location(p, file$8, 230, 18, 6090);
    			attr_dev(div0, "class", "control");
    			add_location(div0, file$8, 223, 16, 5800);
    			attr_dev(div1, "class", "field svelte-1gwiwqo");
    			add_location(div1, file$8, 222, 14, 5764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, input_1);
    			if (input_1.autofocus) input_1.focus();
    			set_input_value(input_1, /*prompt*/ ctx[1]);
    			/*input_1_binding*/ ctx[29](input_1);
    			append_dev(div0, t0);
    			append_dev(div0, p);
    			append_dev(p, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[28]),
    					listen_dev(input_1, "keyup", /*keyup_handler*/ ctx[30], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				{ class: "input" },
    				dirty[0] & /*newInputProps*/ 262144 && /*newInputProps*/ ctx[18]
    			]));

    			if (dirty[0] & /*prompt*/ 2 && input_1.value !== /*prompt*/ ctx[1]) {
    				set_input_value(input_1, /*prompt*/ ctx[1]);
    			}

    			toggle_class(input_1, "svelte-1gwiwqo", true);
    			if (dirty[0] & /*validationMessage*/ 131072) set_data_dev(t1, /*validationMessage*/ ctx[17]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_1_binding*/ ctx[29](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(222:12) {#if hasInput}",
    		ctx
    	});

    	return block;
    }

    // (240:8) {#if showCancel}
    function create_if_block_1$2(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*cancelText*/ ctx[5]);
    			attr_dev(button, "class", "button svelte-1gwiwqo");
    			add_location(button, file$8, 240, 10, 6326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			/*button_binding*/ ctx[31](button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*cancel*/ ctx[20], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cancelText*/ 32) set_data_dev(t, /*cancelText*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			/*button_binding*/ ctx[31](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(240:8) {#if showCancel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*active*/ ctx[0] && create_if_block$5(ctx);

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

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*keydown*/ ctx[23], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
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
    			mounted = false;
    			dispose();
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
    	let _animation;
    	let newInputProps;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dialog', slots, []);
    	let { title = '' } = $$props;
    	let { message } = $$props;
    	let { confirmText = 'OK' } = $$props;
    	let { cancelText = 'Cancel' } = $$props;
    	let { focusOn = 'confirm' } = $$props;
    	let { icon = '' } = $$props;
    	let { iconPack = '' } = $$props;
    	let { hasInput = false } = $$props;
    	let { prompt = null } = $$props;
    	let { showCancel = false } = $$props;
    	let { size = '' } = $$props;
    	let { type = 'is-primary' } = $$props;
    	let { active = true } = $$props;
    	let { animation = 'scale' } = $$props;
    	let { animProps = { start: 1.2 } } = $$props;
    	let { inputProps = {} } = $$props;

    	// export let showClose = true
    	let resolve;

    	let { appendToBody = true } = $$props;
    	let modal;
    	let cancelButton;
    	let confirmButton;
    	let input;
    	let validationMessage = '';
    	const dispatch = createEventDispatcher();

    	onMount(async () => {
    		await tick();

    		if (hasInput) {
    			input.focus();
    		} else if (focusOn === 'cancel' && showCancel) {
    			cancelButton.focus();
    		} else {
    			confirmButton.focus();
    		}
    	});

    	function cancel() {
    		resolve(hasInput ? null : false);
    		close();
    	}

    	function close() {
    		resolve(hasInput ? null : false);
    		$$invalidate(0, active = false);
    		dispatch('destroy');
    	}

    	async function confirm() {
    		if (input && !input.checkValidity()) {
    			$$invalidate(17, validationMessage = input.validationMessage);
    			await tick();
    			input.select();
    			return;
    		}

    		$$invalidate(17, validationMessage = '');
    		resolve(hasInput ? prompt : true);
    		close();
    	}

    	function keydown(e) {
    		if (active && isEscKey(e)) {
    			close();
    		}
    	}

    	const writable_props = [
    		'title',
    		'message',
    		'confirmText',
    		'cancelText',
    		'focusOn',
    		'icon',
    		'iconPack',
    		'hasInput',
    		'prompt',
    		'showCancel',
    		'size',
    		'type',
    		'active',
    		'animation',
    		'animProps',
    		'inputProps',
    		'appendToBody'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	function input_1_input_handler() {
    		prompt = this.value;
    		$$invalidate(1, prompt);
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			input = $$value;
    			$$invalidate(16, input);
    		});
    	}

    	const keyup_handler = e => isEnterKey(e) && confirm();

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cancelButton = $$value;
    			$$invalidate(14, cancelButton);
    		});
    	}

    	function button_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			confirmButton = $$value;
    			$$invalidate(15, confirmButton);
    		});
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			modal = $$value;
    			$$invalidate(13, modal);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('message' in $$props) $$invalidate(3, message = $$props.message);
    		if ('confirmText' in $$props) $$invalidate(4, confirmText = $$props.confirmText);
    		if ('cancelText' in $$props) $$invalidate(5, cancelText = $$props.cancelText);
    		if ('focusOn' in $$props) $$invalidate(24, focusOn = $$props.focusOn);
    		if ('icon' in $$props) $$invalidate(6, icon = $$props.icon);
    		if ('iconPack' in $$props) $$invalidate(7, iconPack = $$props.iconPack);
    		if ('hasInput' in $$props) $$invalidate(8, hasInput = $$props.hasInput);
    		if ('prompt' in $$props) $$invalidate(1, prompt = $$props.prompt);
    		if ('showCancel' in $$props) $$invalidate(9, showCancel = $$props.showCancel);
    		if ('size' in $$props) $$invalidate(10, size = $$props.size);
    		if ('type' in $$props) $$invalidate(11, type = $$props.type);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('animation' in $$props) $$invalidate(25, animation = $$props.animation);
    		if ('animProps' in $$props) $$invalidate(12, animProps = $$props.animProps);
    		if ('inputProps' in $$props) $$invalidate(26, inputProps = $$props.inputProps);
    		if ('appendToBody' in $$props) $$invalidate(27, appendToBody = $$props.appendToBody);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		Icon,
    		chooseAnimation,
    		isEnterKey,
    		isEscKey,
    		title,
    		message,
    		confirmText,
    		cancelText,
    		focusOn,
    		icon,
    		iconPack,
    		hasInput,
    		prompt,
    		showCancel,
    		size,
    		type,
    		active,
    		animation,
    		animProps,
    		inputProps,
    		resolve,
    		appendToBody,
    		modal,
    		cancelButton,
    		confirmButton,
    		input,
    		validationMessage,
    		dispatch,
    		cancel,
    		close,
    		confirm,
    		keydown,
    		newInputProps,
    		_animation
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('message' in $$props) $$invalidate(3, message = $$props.message);
    		if ('confirmText' in $$props) $$invalidate(4, confirmText = $$props.confirmText);
    		if ('cancelText' in $$props) $$invalidate(5, cancelText = $$props.cancelText);
    		if ('focusOn' in $$props) $$invalidate(24, focusOn = $$props.focusOn);
    		if ('icon' in $$props) $$invalidate(6, icon = $$props.icon);
    		if ('iconPack' in $$props) $$invalidate(7, iconPack = $$props.iconPack);
    		if ('hasInput' in $$props) $$invalidate(8, hasInput = $$props.hasInput);
    		if ('prompt' in $$props) $$invalidate(1, prompt = $$props.prompt);
    		if ('showCancel' in $$props) $$invalidate(9, showCancel = $$props.showCancel);
    		if ('size' in $$props) $$invalidate(10, size = $$props.size);
    		if ('type' in $$props) $$invalidate(11, type = $$props.type);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('animation' in $$props) $$invalidate(25, animation = $$props.animation);
    		if ('animProps' in $$props) $$invalidate(12, animProps = $$props.animProps);
    		if ('inputProps' in $$props) $$invalidate(26, inputProps = $$props.inputProps);
    		if ('resolve' in $$props) resolve = $$props.resolve;
    		if ('appendToBody' in $$props) $$invalidate(27, appendToBody = $$props.appendToBody);
    		if ('modal' in $$props) $$invalidate(13, modal = $$props.modal);
    		if ('cancelButton' in $$props) $$invalidate(14, cancelButton = $$props.cancelButton);
    		if ('confirmButton' in $$props) $$invalidate(15, confirmButton = $$props.confirmButton);
    		if ('input' in $$props) $$invalidate(16, input = $$props.input);
    		if ('validationMessage' in $$props) $$invalidate(17, validationMessage = $$props.validationMessage);
    		if ('newInputProps' in $$props) $$invalidate(18, newInputProps = $$props.newInputProps);
    		if ('_animation' in $$props) $$invalidate(19, _animation = $$props._animation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*animation*/ 33554432) {
    			$$invalidate(19, _animation = chooseAnimation(animation));
    		}

    		if ($$self.$$.dirty[0] & /*modal, active, appendToBody*/ 134225921) {
    			{
    				if (modal && active && appendToBody) {
    					modal.parentNode?.removeChild(modal);
    					document.body.appendChild(modal);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*inputProps*/ 67108864) {
    			$$invalidate(18, newInputProps = { required: true, ...inputProps });
    		}
    	};

    	return [
    		active,
    		prompt,
    		title,
    		message,
    		confirmText,
    		cancelText,
    		icon,
    		iconPack,
    		hasInput,
    		showCancel,
    		size,
    		type,
    		animProps,
    		modal,
    		cancelButton,
    		confirmButton,
    		input,
    		validationMessage,
    		newInputProps,
    		_animation,
    		cancel,
    		close,
    		confirm,
    		keydown,
    		focusOn,
    		animation,
    		inputProps,
    		appendToBody,
    		input_1_input_handler,
    		input_1_binding,
    		keyup_handler,
    		button_binding,
    		button_binding_1,
    		div4_binding
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				title: 2,
    				message: 3,
    				confirmText: 4,
    				cancelText: 5,
    				focusOn: 24,
    				icon: 6,
    				iconPack: 7,
    				hasInput: 8,
    				prompt: 1,
    				showCancel: 9,
    				size: 10,
    				type: 11,
    				active: 0,
    				animation: 25,
    				animProps: 12,
    				inputProps: 26,
    				appendToBody: 27
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[3] === undefined && !('message' in props)) {
    			console.warn("<Dialog> was created without expected prop 'message'");
    		}
    	}

    	get title() {
    		return this.$$.ctx[2];
    	}

    	set title(title) {
    		this.$$set({ title });
    		flush();
    	}

    	get message() {
    		return this.$$.ctx[3];
    	}

    	set message(message) {
    		this.$$set({ message });
    		flush();
    	}

    	get confirmText() {
    		return this.$$.ctx[4];
    	}

    	set confirmText(confirmText) {
    		this.$$set({ confirmText });
    		flush();
    	}

    	get cancelText() {
    		return this.$$.ctx[5];
    	}

    	set cancelText(cancelText) {
    		this.$$set({ cancelText });
    		flush();
    	}

    	get focusOn() {
    		return this.$$.ctx[24];
    	}

    	set focusOn(focusOn) {
    		this.$$set({ focusOn });
    		flush();
    	}

    	get icon() {
    		return this.$$.ctx[6];
    	}

    	set icon(icon) {
    		this.$$set({ icon });
    		flush();
    	}

    	get iconPack() {
    		return this.$$.ctx[7];
    	}

    	set iconPack(iconPack) {
    		this.$$set({ iconPack });
    		flush();
    	}

    	get hasInput() {
    		return this.$$.ctx[8];
    	}

    	set hasInput(hasInput) {
    		this.$$set({ hasInput });
    		flush();
    	}

    	get prompt() {
    		return this.$$.ctx[1];
    	}

    	set prompt(prompt) {
    		this.$$set({ prompt });
    		flush();
    	}

    	get showCancel() {
    		return this.$$.ctx[9];
    	}

    	set showCancel(showCancel) {
    		this.$$set({ showCancel });
    		flush();
    	}

    	get size() {
    		return this.$$.ctx[10];
    	}

    	set size(size) {
    		this.$$set({ size });
    		flush();
    	}

    	get type() {
    		return this.$$.ctx[11];
    	}

    	set type(type) {
    		this.$$set({ type });
    		flush();
    	}

    	get active() {
    		return this.$$.ctx[0];
    	}

    	set active(active) {
    		this.$$set({ active });
    		flush();
    	}

    	get animation() {
    		return this.$$.ctx[25];
    	}

    	set animation(animation) {
    		this.$$set({ animation });
    		flush();
    	}

    	get animProps() {
    		return this.$$.ctx[12];
    	}

    	set animProps(animProps) {
    		this.$$set({ animProps });
    		flush();
    	}

    	get inputProps() {
    		return this.$$.ctx[26];
    	}

    	set inputProps(inputProps) {
    		this.$$set({ inputProps });
    		flush();
    	}

    	get appendToBody() {
    		return this.$$.ctx[27];
    	}

    	set appendToBody(appendToBody) {
    		this.$$set({ appendToBody });
    		flush();
    	}
    }

    function createDialog(props) {
      if (typeof props === 'string') props = { message: props };

      const dialog = new Dialog({
        target: document.body,
        props,
        intro: true,
      });

      dialog.$on('destroy', () => {
        dialog.$destroy();
      });

      return dialog.promise
    }

    function alert(props) {
      return createDialog(props);
    }

    function confirm(props) {
      if (typeof props === 'string') props = { message: props };

      return createDialog({ showCancel: true, ...props });
    }

    function prompt(props) {
      if (typeof props === 'string') props = { message: props };

      return createDialog({ hasInput: true, confirmText: 'Done', ...props });
    }

    Dialog.alert = alert;
    Dialog.confirm = confirm;
    Dialog.prompt = prompt;

    var css_248z$d = "";
    styleInject(css_248z$d);

    var css_248z$c = "";
    styleInject(css_248z$c);

    var css_248z$b = "";
    styleInject(css_248z$b);

    /* node_modules/svelma/src/components/Modal/Modal.svelte generated by Svelte v3.48.0 */
    const file$7 = "node_modules/svelma/src/components/Modal/Modal.svelte";

    // (44:2) {#if showClose}
    function create_if_block$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "modal-close is-large");
    			attr_dev(button, "aria-label", "close");
    			add_location(button, file$7, 44, 4, 990);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(44:2) {#if showClose}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let div1_transition;
    	let t1;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let if_block = /*showClose*/ ctx[3] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file$7, 39, 2, 785);
    			attr_dev(div1, "class", "modal-content");
    			add_location(div1, file$7, 40, 2, 841);
    			attr_dev(div2, "class", div2_class_value = "modal " + /*size*/ ctx[2]);
    			toggle_class(div2, "is-active", /*active*/ ctx[0]);
    			add_location(div2, file$7, 38, 0, 713);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div2, t1);
    			if (if_block) if_block.m(div2, null);
    			/*div2_binding*/ ctx[12](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*keydown*/ ctx[7], false, false, false),
    					listen_dev(div0, "click", /*close*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*showClose*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*size*/ 4 && div2_class_value !== (div2_class_value = "modal " + /*size*/ ctx[2])) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*size, active*/ 5) {
    				toggle_class(div2, "is-active", /*active*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*_animation*/ ctx[5], /*animProps*/ ctx[1], true);
    					div1_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (local) {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*_animation*/ ctx[5], /*animProps*/ ctx[1], false);
    				div1_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div1_transition) div1_transition.end();
    			if (if_block) if_block.d();
    			/*div2_binding*/ ctx[12](null);
    			mounted = false;
    			run_all(dispose);
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
    	let _animation;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default']);
    	let { active = true } = $$props;
    	let { animation = 'scale' } = $$props;
    	let { animProps = { start: 1.2 } } = $$props;
    	let { size = '' } = $$props;
    	let { showClose = true } = $$props;
    	let { onBody = true } = $$props;
    	let modal;

    	onMount(() => {
    		
    	});

    	function close() {
    		$$invalidate(0, active = false);
    	}

    	function keydown(e) {
    		if (active && isEscKey(e)) {
    			close();
    		}
    	}

    	const writable_props = ['active', 'animation', 'animProps', 'size', 'showClose', 'onBody'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			modal = $$value;
    			$$invalidate(4, modal);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('animation' in $$props) $$invalidate(8, animation = $$props.animation);
    		if ('animProps' in $$props) $$invalidate(1, animProps = $$props.animProps);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('showClose' in $$props) $$invalidate(3, showClose = $$props.showClose);
    		if ('onBody' in $$props) $$invalidate(9, onBody = $$props.onBody);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		chooseAnimation,
    		isEscKey,
    		active,
    		animation,
    		animProps,
    		size,
    		showClose,
    		onBody,
    		modal,
    		close,
    		keydown,
    		_animation
    	});

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('animation' in $$props) $$invalidate(8, animation = $$props.animation);
    		if ('animProps' in $$props) $$invalidate(1, animProps = $$props.animProps);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('showClose' in $$props) $$invalidate(3, showClose = $$props.showClose);
    		if ('onBody' in $$props) $$invalidate(9, onBody = $$props.onBody);
    		if ('modal' in $$props) $$invalidate(4, modal = $$props.modal);
    		if ('_animation' in $$props) $$invalidate(5, _animation = $$props._animation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*animation*/ 256) {
    			$$invalidate(5, _animation = chooseAnimation(animation));
    		}

    		if ($$self.$$.dirty & /*modal, active, onBody*/ 529) {
    			{
    				if (modal && active && onBody) {
    					// modal.parentNode?.removeChild(modal)
    					document.body.appendChild(modal);
    				}
    			}
    		}
    	};

    	return [
    		active,
    		animProps,
    		size,
    		showClose,
    		modal,
    		_animation,
    		close,
    		keydown,
    		animation,
    		onBody,
    		$$scope,
    		slots,
    		div2_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			active: 0,
    			animation: 8,
    			animProps: 1,
    			size: 2,
    			showClose: 3,
    			onBody: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get active() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animation() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animation(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onBody() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onBody(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Modal/ModalCard.svelte generated by Svelte v3.48.0 */
    const file$6 = "node_modules/svelma/src/components/Modal/ModalCard.svelte";

    function create_fragment$7(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let header;
    	let p;
    	let t1;
    	let t2;
    	let button0;
    	let t3;
    	let section;
    	let t4;
    	let footer;
    	let button1;
    	let t6;
    	let button2;
    	let div1_transition;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			header = element("header");
    			p = element("p");
    			t1 = text(/*title*/ ctx[1]);
    			t2 = space();
    			button0 = element("button");
    			t3 = space();
    			section = element("section");
    			if (default_slot) default_slot.c();
    			t4 = space();
    			footer = element("footer");
    			button1 = element("button");
    			button1.textContent = "Save changes";
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "Cancel";
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file$6, 37, 2, 753);
    			attr_dev(p, "class", "modal-card-title");
    			add_location(p, file$6, 40, 6, 917);
    			attr_dev(button0, "class", "delete");
    			attr_dev(button0, "aria-label", "close");
    			add_location(button0, file$6, 41, 6, 963);
    			attr_dev(header, "class", "modal-card-head");
    			add_location(header, file$6, 39, 4, 878);
    			attr_dev(section, "class", "modal-card-body");
    			add_location(section, file$6, 43, 4, 1043);
    			attr_dev(button1, "class", "button is-success");
    			add_location(button1, file$6, 47, 6, 1150);
    			attr_dev(button2, "class", "button");
    			add_location(button2, file$6, 48, 6, 1212);
    			attr_dev(footer, "class", "modal-card-foot");
    			add_location(footer, file$6, 46, 4, 1111);
    			attr_dev(div1, "class", "modal-card");
    			add_location(div1, file$6, 38, 2, 809);
    			attr_dev(div2, "class", div2_class_value = "modal " + /*size*/ ctx[3]);
    			toggle_class(div2, "is-active", /*active*/ ctx[0]);
    			add_location(div2, file$6, 36, 0, 680);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, header);
    			append_dev(header, p);
    			append_dev(p, t1);
    			append_dev(header, t2);
    			append_dev(header, button0);
    			append_dev(div1, t3);
    			append_dev(div1, section);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			append_dev(div1, t4);
    			append_dev(div1, footer);
    			append_dev(footer, button1);
    			append_dev(footer, t6);
    			append_dev(footer, button2);
    			/*div2_binding*/ ctx[13](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*keydown*/ ctx[7], false, false, false),
    					listen_dev(div0, "click", /*close*/ ctx[6], false, false, false),
    					listen_dev(button0, "click", /*close*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*size*/ 8 && div2_class_value !== (div2_class_value = "modal " + /*size*/ ctx[3])) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*size, active*/ 9) {
    				toggle_class(div2, "is-active", /*active*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*_animation*/ ctx[5], /*animProps*/ ctx[2], true);
    					div1_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (local) {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*_animation*/ ctx[5], /*animProps*/ ctx[2], false);
    				div1_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
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
    	let _animation;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalCard', slots, ['default']);
    	let { active = true } = $$props;
    	let { title = "Modal Title" } = $$props;
    	let { animation = 'scale' } = $$props;
    	let { animProps = { start: 1.2 } } = $$props;
    	let { size = '' } = $$props;
    	let { showClose = true } = $$props;
    	let { onBody = true } = $$props;
    	let modal;

    	onMount(() => {
    		
    	});

    	function close() {
    		$$invalidate(0, active = false);
    	}

    	function keydown(e) {
    		if (active && isEscKey(e)) {
    			close();
    		}
    	}

    	const writable_props = ['active', 'title', 'animation', 'animProps', 'size', 'showClose', 'onBody'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ModalCard> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			modal = $$value;
    			$$invalidate(4, modal);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('animation' in $$props) $$invalidate(8, animation = $$props.animation);
    		if ('animProps' in $$props) $$invalidate(2, animProps = $$props.animProps);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('showClose' in $$props) $$invalidate(9, showClose = $$props.showClose);
    		if ('onBody' in $$props) $$invalidate(10, onBody = $$props.onBody);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		chooseAnimation,
    		isEscKey,
    		active,
    		title,
    		animation,
    		animProps,
    		size,
    		showClose,
    		onBody,
    		modal,
    		close,
    		keydown,
    		_animation
    	});

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('animation' in $$props) $$invalidate(8, animation = $$props.animation);
    		if ('animProps' in $$props) $$invalidate(2, animProps = $$props.animProps);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('showClose' in $$props) $$invalidate(9, showClose = $$props.showClose);
    		if ('onBody' in $$props) $$invalidate(10, onBody = $$props.onBody);
    		if ('modal' in $$props) $$invalidate(4, modal = $$props.modal);
    		if ('_animation' in $$props) $$invalidate(5, _animation = $$props._animation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*animation*/ 256) {
    			$$invalidate(5, _animation = chooseAnimation(animation));
    		}

    		if ($$self.$$.dirty & /*modal, active, onBody*/ 1041) {
    			{
    				if (modal && active && onBody) {
    					document.body.appendChild(modal);
    				}
    			}
    		}
    	};

    	return [
    		active,
    		title,
    		animProps,
    		size,
    		modal,
    		_animation,
    		close,
    		keydown,
    		animation,
    		showClose,
    		onBody,
    		$$scope,
    		slots,
    		div2_binding
    	];
    }

    class ModalCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			active: 0,
    			title: 1,
    			animation: 8,
    			animProps: 2,
    			size: 3,
    			showClose: 9,
    			onBody: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalCard",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get active() {
    		throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animation() {
    		throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animation(value) {
    		throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animProps() {
    		throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animProps(value) {
    		throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClose() {
    		throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClose(value) {
    		throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onBody() {
    		throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onBody(value) {
    		throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Modal.open = open;
    ModalCard.open = open;

    function open(props) {
      const modal = new Modal({
        target: document.body,
        props,
        intro: true
      });

      modal.close = () => modal.$destroy();

      return modal;
    }

    var css_248z$a = "";
    styleInject(css_248z$a);

    /* node_modules/svelma/src/components/Notices.svelte generated by Svelte v3.48.0 */

    const file$5 = "node_modules/svelma/src/components/Notices.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "notices " + /*positionClass*/ ctx[1] + " svelte-gicv46");
    			add_location(div, file$5, 39, 0, 884);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[4](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*positionClass*/ 2 && div_class_value !== (div_class_value = "notices " + /*positionClass*/ ctx[1] + " svelte-gicv46")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[4](null);
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

    const notices = {};

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notices', slots, []);
    	let { position = 'top' } = $$props;
    	let container;
    	let positionClass;

    	function insert(el) {
    		container.insertAdjacentElement('afterbegin', el);
    	}

    	const writable_props = ['position'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Notices> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('position' in $$props) $$invalidate(2, position = $$props.position);
    	};

    	$$self.$capture_state = () => ({
    		notices,
    		position,
    		container,
    		positionClass,
    		insert
    	});

    	$$self.$inject_state = $$props => {
    		if ('position' in $$props) $$invalidate(2, position = $$props.position);
    		if ('container' in $$props) $$invalidate(0, container = $$props.container);
    		if ('positionClass' in $$props) $$invalidate(1, positionClass = $$props.positionClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position*/ 4) {
    			$$invalidate(1, positionClass = position === 'top' ? 'is-top' : 'is-bottom');
    		}
    	};

    	return [container, positionClass, position, insert, div_binding];
    }

    class Notices extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { position: 2, insert: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notices",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get position() {
    		throw new Error("<Notices>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Notices>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get insert() {
    		return this.$$.ctx[3];
    	}

    	set insert(value) {
    		throw new Error("<Notices>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$9 = "";
    styleInject(css_248z$9);

    /* node_modules/svelma/src/components/Notice.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1$1 } = globals;
    const file$4 = "node_modules/svelma/src/components/Notice.svelte";

    // (96:0) {#if active}
    function create_if_block$3(ctx) {
    	let div;
    	let div_class_value;
    	let div_aria_hidden_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "notice " + /*position*/ ctx[1] + " svelte-x3pnf9");
    			attr_dev(div, "aria-hidden", div_aria_hidden_value = !/*active*/ ctx[0]);
    			add_location(div, file$4, 96, 2, 1946);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[10](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "outroend", /*remove*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*position*/ 2 && div_class_value !== (div_class_value = "notice " + /*position*/ ctx[1] + " svelte-x3pnf9")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*active*/ 1 && div_aria_hidden_value !== (div_aria_hidden_value = !/*active*/ ctx[0])) {
    				attr_dev(div, "aria-hidden", div_aria_hidden_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { y: /*transitionY*/ ctx[4] });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();

    			div_outro = create_out_transition(div, fade, {
    				duration: /*transitionOut*/ ctx[2] ? 400 : 0
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[10](null);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(96:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] && create_if_block$3(ctx);

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
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
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

    const allowedProps = ['active', 'position', 'duration'];

    function filterProps(props) {
    	const newProps = {};

    	Object.keys(props).forEach(key => {
    		if (allowedProps.includes(key)) newProps[key] = props[key];
    	});

    	return newProps;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let transitionY;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notice', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { active = true } = $$props;
    	let { position = 'is-top' } = $$props;
    	let { duration = 2000 } = $$props;
    	let { transitionOut = true } = $$props;
    	let el;
    	let parent;
    	let timer;

    	function close() {
    		$$invalidate(0, active = false);
    	}

    	function remove() {
    		clearTimeout(timer);

    		// Just making sure
    		$$invalidate(0, active = false);

    		dispatch('destroyed');
    	}

    	async function setupContainers() {
    		await tick;

    		if (!notices.top) {
    			notices.top = new Notices({
    					target: document.body,
    					props: { position: 'top' }
    				});
    		}

    		if (!notices.bottom) {
    			notices.bottom = new Notices({
    					target: document.body,
    					props: { position: 'bottom' }
    				});
    		}
    	}

    	function chooseParent() {
    		parent = notices.top;
    		if (position && position.indexOf('is-bottom') === 0) parent = notices.bottom;
    		parent.insert(el);
    	}

    	onMount(async () => {
    		await setupContainers();
    		chooseParent();

    		timer = setTimeout(
    			() => {
    				close();
    			},
    			duration
    		);
    	});

    	const writable_props = ['active', 'position', 'duration', 'transitionOut'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Notice> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(3, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('position' in $$props) $$invalidate(1, position = $$props.position);
    		if ('duration' in $$props) $$invalidate(6, duration = $$props.duration);
    		if ('transitionOut' in $$props) $$invalidate(2, transitionOut = $$props.transitionOut);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		allowedProps,
    		filterProps,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		fly,
    		fade,
    		Notices,
    		notices,
    		dispatch,
    		active,
    		position,
    		duration,
    		transitionOut,
    		el,
    		parent,
    		timer,
    		close,
    		remove,
    		setupContainers,
    		chooseParent,
    		transitionY
    	});

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('position' in $$props) $$invalidate(1, position = $$props.position);
    		if ('duration' in $$props) $$invalidate(6, duration = $$props.duration);
    		if ('transitionOut' in $$props) $$invalidate(2, transitionOut = $$props.transitionOut);
    		if ('el' in $$props) $$invalidate(3, el = $$props.el);
    		if ('parent' in $$props) parent = $$props.parent;
    		if ('timer' in $$props) timer = $$props.timer;
    		if ('transitionY' in $$props) $$invalidate(4, transitionY = $$props.transitionY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position*/ 2) {
    			$$invalidate(4, transitionY = ~position.indexOf('is-top') ? -200 : 200);
    		}
    	};

    	return [
    		active,
    		position,
    		transitionOut,
    		el,
    		transitionY,
    		remove,
    		duration,
    		close,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Notice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			active: 0,
    			position: 1,
    			duration: 6,
    			transitionOut: 2,
    			close: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notice",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get active() {
    		throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionOut() {
    		throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionOut(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		return this.$$.ctx[7];
    	}

    	set close(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$8 = "";
    styleInject(css_248z$8);

    /* node_modules/svelma/src/components/Notification/Notification.svelte generated by Svelte v3.48.0 */
    const file$3 = "node_modules/svelma/src/components/Notification/Notification.svelte";

    // (92:0) {#if active}
    function create_if_block$2(ctx) {
    	let article;
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let article_class_value;
    	let article_transition;
    	let current;
    	let if_block0 = /*showClose*/ ctx[2] && create_if_block_2(ctx);
    	let if_block1 = /*icon*/ ctx[3] && create_if_block_1$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "media-content");
    			add_location(div0, file$3, 102, 6, 2847);
    			attr_dev(div1, "class", "media svelte-1j2lhcz");
    			add_location(div1, file$3, 96, 4, 2678);
    			attr_dev(article, "class", article_class_value = "notification " + /*type*/ ctx[1] + " svelte-1j2lhcz");
    			add_location(article, file$3, 92, 2, 2507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			if (if_block0) if_block0.m(article, null);
    			append_dev(article, t0);
    			append_dev(article, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showClose*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(article, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*icon*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*icon*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*type*/ 2 && article_class_value !== (article_class_value = "notification " + /*type*/ ctx[1] + " svelte-1j2lhcz")) {
    				attr_dev(article, "class", article_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(default_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!article_transition) article_transition = create_bidirectional_transition(article, fade, {}, true);
    					article_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(default_slot, local);

    			if (local) {
    				if (!article_transition) article_transition = create_bidirectional_transition(article, fade, {}, false);
    				article_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && article_transition) article_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(92:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (94:4) {#if showClose}
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "delete");
    			attr_dev(button, "aria-label", /*ariaCloseLabel*/ ctx[5]);
    			add_location(button, file$3, 94, 6, 2593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ariaCloseLabel*/ 32) {
    				attr_dev(button, "aria-label", /*ariaCloseLabel*/ ctx[5]);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(94:4) {#if showClose}",
    		ctx
    	});

    	return block;
    }

    // (98:6) {#if icon}
    function create_if_block_1$1(ctx) {
    	let div;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[4],
    				icon: /*newIcon*/ ctx[6],
    				size: "is-large"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icon_1.$$.fragment);
    			attr_dev(div, "class", "media-left");
    			add_location(div, file$3, 98, 8, 2723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*iconPack*/ 16) icon_1_changes.pack = /*iconPack*/ ctx[4];
    			if (dirty & /*newIcon*/ 64) icon_1_changes.icon = /*newIcon*/ ctx[6];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(98:6) {#if icon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] && create_if_block$2(ctx);

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
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notification', slots, ['default']);
    	let { type = '' } = $$props;
    	let { active = true } = $$props;
    	let { showClose = true } = $$props;
    	let { autoClose = false } = $$props;
    	let { duration = 2000 } = $$props;
    	let { icon = '' } = $$props;
    	let { iconPack = '' } = $$props;
    	let { ariaCloseLabel = '' } = $$props;

    	/** Text for notification, when used programmatically
     * @svelte-prop {String} message
     * */
    	/** Where the notification will show on the screen when used programmatically
     * @svelte-prop {String} [position=is-top-right]
     * @values <code>is-top</code>, <code>is-bottom</code>, <code>is-top-left</code>, <code>is-top-right</code>, <code>is-bottom-left</code>, <code>is-bottom-right</code>
     * */
    	const dispatch = createEventDispatcher();

    	let newIcon = '';
    	let timer;

    	function close() {
    		$$invalidate(0, active = false);
    		if (timer) clearTimeout(timer);
    		dispatch('close', active);
    	}

    	const writable_props = [
    		'type',
    		'active',
    		'showClose',
    		'autoClose',
    		'duration',
    		'icon',
    		'iconPack',
    		'ariaCloseLabel'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Notification> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('showClose' in $$props) $$invalidate(2, showClose = $$props.showClose);
    		if ('autoClose' in $$props) $$invalidate(8, autoClose = $$props.autoClose);
    		if ('duration' in $$props) $$invalidate(9, duration = $$props.duration);
    		if ('icon' in $$props) $$invalidate(3, icon = $$props.icon);
    		if ('iconPack' in $$props) $$invalidate(4, iconPack = $$props.iconPack);
    		if ('ariaCloseLabel' in $$props) $$invalidate(5, ariaCloseLabel = $$props.ariaCloseLabel);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		fly,
    		fade,
    		Icon,
    		Notice,
    		filterProps,
    		typeToIcon,
    		type,
    		active,
    		showClose,
    		autoClose,
    		duration,
    		icon,
    		iconPack,
    		ariaCloseLabel,
    		dispatch,
    		newIcon,
    		timer,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('showClose' in $$props) $$invalidate(2, showClose = $$props.showClose);
    		if ('autoClose' in $$props) $$invalidate(8, autoClose = $$props.autoClose);
    		if ('duration' in $$props) $$invalidate(9, duration = $$props.duration);
    		if ('icon' in $$props) $$invalidate(3, icon = $$props.icon);
    		if ('iconPack' in $$props) $$invalidate(4, iconPack = $$props.iconPack);
    		if ('ariaCloseLabel' in $$props) $$invalidate(5, ariaCloseLabel = $$props.ariaCloseLabel);
    		if ('newIcon' in $$props) $$invalidate(6, newIcon = $$props.newIcon);
    		if ('timer' in $$props) timer = $$props.timer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon, type*/ 10) {
    			{
    				if (icon === true) {
    					$$invalidate(6, newIcon = typeToIcon(type));
    				} else {
    					$$invalidate(6, newIcon = icon);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*active, autoClose, duration*/ 769) {
    			{
    				if (active && autoClose) {
    					timer = setTimeout(
    						() => {
    							if (active) close();
    						},
    						duration
    					);
    				}
    			}
    		}
    	};

    	return [
    		active,
    		type,
    		showClose,
    		icon,
    		iconPack,
    		ariaCloseLabel,
    		newIcon,
    		close,
    		autoClose,
    		duration,
    		$$scope,
    		slots
    	];
    }

    class Notification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			type: 1,
    			active: 0,
    			showClose: 2,
    			autoClose: 8,
    			duration: 9,
    			icon: 3,
    			iconPack: 4,
    			ariaCloseLabel: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notification",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get type() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClose() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClose(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoClose() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoClose(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconPack() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconPack(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaCloseLabel() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaCloseLabel(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$7 = "";
    styleInject(css_248z$7);

    /* node_modules/svelma/src/components/Notification/NotificationNotice.svelte generated by Svelte v3.48.0 */

    // (34:2) <Notification {...notificationProps}>
    function create_default_slot_1$1(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*message*/ ctx[0], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 1) html_tag.p(/*message*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(34:2) <Notification {...notificationProps}>",
    		ctx
    	});

    	return block;
    }

    // (33:0) <Notice {...props} transitionOut={true}>
    function create_default_slot$3(ctx) {
    	let notification;
    	let current;
    	const notification_spread_levels = [/*notificationProps*/ ctx[1]];

    	let notification_props = {
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < notification_spread_levels.length; i += 1) {
    		notification_props = assign(notification_props, notification_spread_levels[i]);
    	}

    	notification = new Notification({
    			props: notification_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notification.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notification, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notification_changes = (dirty & /*notificationProps*/ 2)
    			? get_spread_update(notification_spread_levels, [get_spread_object(/*notificationProps*/ ctx[1])])
    			: {};

    			if (dirty & /*$$scope, message*/ 129) {
    				notification_changes.$$scope = { dirty, ctx };
    			}

    			notification.$set(notification_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notification.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notification.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notification, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(33:0) <Notice {...props} transitionOut={true}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let notice;
    	let current;
    	const notice_spread_levels = [/*props*/ ctx[2], { transitionOut: true }];

    	let notice_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < notice_spread_levels.length; i += 1) {
    		notice_props = assign(notice_props, notice_spread_levels[i]);
    	}

    	notice = new Notice({ props: notice_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(notice.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(notice, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const notice_changes = (dirty & /*props*/ 4)
    			? get_spread_update(notice_spread_levels, [get_spread_object(/*props*/ ctx[2]), notice_spread_levels[1]])
    			: {};

    			if (dirty & /*$$scope, notificationProps, message*/ 131) {
    				notice_changes.$$scope = { dirty, ctx };
    			}

    			notice.$set(notice_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notice.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notice.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notice, detaching);
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
    	let props;
    	let notificationProps;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotificationNotice', slots, []);
    	let { message } = $$props;
    	let { duration = 2000 } = $$props;
    	let { position = 'is-top-right' } = $$props;

    	function removeNonNoficationProps(props) {
    		const newProps = {};
    		const blacklist = ['duration', 'message', 'position'];

    		Object.keys(props).forEach(key => {
    			if (!blacklist.includes(key)) newProps[key] = props[key];
    		});

    		return newProps;
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('message' in $$new_props) $$invalidate(0, message = $$new_props.message);
    		if ('duration' in $$new_props) $$invalidate(3, duration = $$new_props.duration);
    		if ('position' in $$new_props) $$invalidate(4, position = $$new_props.position);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		fly,
    		fade,
    		Notice,
    		filterProps,
    		Notification,
    		message,
    		duration,
    		position,
    		removeNonNoficationProps,
    		notificationProps,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ('message' in $$props) $$invalidate(0, message = $$new_props.message);
    		if ('duration' in $$props) $$invalidate(3, duration = $$new_props.duration);
    		if ('position' in $$props) $$invalidate(4, position = $$new_props.position);
    		if ('notificationProps' in $$props) $$invalidate(1, notificationProps = $$new_props.notificationProps);
    		if ('props' in $$props) $$invalidate(2, props = $$new_props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(2, props = {
    			...filterProps($$props),
    			duration,
    			position
    		});

    		$$invalidate(1, notificationProps = { ...removeNonNoficationProps($$props) });
    	};

    	$$props = exclude_internal_props($$props);
    	return [message, notificationProps, props, duration, position];
    }

    class NotificationNotice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { message: 0, duration: 3, position: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationNotice",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[0] === undefined && !('message' in props)) {
    			console.warn("<NotificationNotice> was created without expected prop 'message'");
    		}
    	}

    	get message() {
    		throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Notification.create = create$2;

    function create$2(props) {
      if (typeof props === 'string') props = { message: props };

      const notification = new NotificationNotice({
        target: document.body,
        props,
        intro: true,
      });

      notification.$on('destroyed', notification.$destroy);

      return notification
    }

    var css_248z$6 = "";
    styleInject(css_248z$6);

    /* node_modules/svelma/src/components/Snackbar/Snackbar.svelte generated by Svelte v3.48.0 */

    const { Error: Error_1 } = globals;
    const file$2 = "node_modules/svelma/src/components/Snackbar/Snackbar.svelte";

    // (92:4) {#if actionText}
    function create_if_block$1(ctx) {
    	let div;
    	let button;
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text(/*actionText*/ ctx[2]);
    			attr_dev(button, "class", button_class_value = "button " + /*newType*/ ctx[5] + " svelte-6ks3pf");
    			add_location(button, file$2, 93, 8, 2721);
    			attr_dev(div, "class", "action svelte-6ks3pf");
    			add_location(div, file$2, 92, 6, 2674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*action*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*actionText*/ 4) set_data_dev(t, /*actionText*/ ctx[2]);

    			if (dirty & /*newType*/ 32 && button_class_value !== (button_class_value = "button " + /*newType*/ ctx[5] + " svelte-6ks3pf")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(92:4) {#if actionText}",
    		ctx
    	});

    	return block;
    }

    // (86:0) <Notice {...props} bind:this={notice} transitionOut={true}>
    function create_default_slot$2(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div1_class_value;
    	let if_block = /*actionText*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "text svelte-6ks3pf");
    			add_location(div0, file$2, 87, 4, 2515);
    			attr_dev(div1, "class", div1_class_value = "snackbar " + /*background*/ ctx[1] + " svelte-6ks3pf");
    			attr_dev(div1, "role", "alert");
    			toggle_class(div1, "has-background-dark", !/*background*/ ctx[1]);
    			add_location(div1, file$2, 86, 2, 2422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = /*message*/ ctx[0];
    			append_dev(div1, t);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 1) div0.innerHTML = /*message*/ ctx[0];
    			if (/*actionText*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*background*/ 2 && div1_class_value !== (div1_class_value = "snackbar " + /*background*/ ctx[1] + " svelte-6ks3pf")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*background, background*/ 2) {
    				toggle_class(div1, "has-background-dark", !/*background*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(86:0) <Notice {...props} bind:this={notice} transitionOut={true}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let notice_1;
    	let current;
    	const notice_1_spread_levels = [/*props*/ ctx[4], { transitionOut: true }];

    	let notice_1_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < notice_1_spread_levels.length; i += 1) {
    		notice_1_props = assign(notice_1_props, notice_1_spread_levels[i]);
    	}

    	notice_1 = new Notice({ props: notice_1_props, $$inline: true });
    	/*notice_1_binding*/ ctx[11](notice_1);

    	const block = {
    		c: function create() {
    			create_component(notice_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(notice_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const notice_1_changes = (dirty & /*props*/ 16)
    			? get_spread_update(notice_1_spread_levels, [get_spread_object(/*props*/ ctx[4]), notice_1_spread_levels[1]])
    			: {};

    			if (dirty & /*$$scope, background, newType, actionText, message*/ 8231) {
    				notice_1_changes.$$scope = { dirty, ctx };
    			}

    			notice_1.$set(notice_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notice_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notice_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*notice_1_binding*/ ctx[11](null);
    			destroy_component(notice_1, detaching);
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
    	let newType;
    	let props;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Snackbar', slots, []);
    	let { message } = $$props;
    	let { duration = 3500 } = $$props;
    	let { position = 'is-bottom-right' } = $$props;
    	let { type = 'is-primary' } = $$props;
    	let { background = '' } = $$props;
    	let { actionText = 'OK' } = $$props;

    	let { onAction = () => {
    		
    	} } = $$props;

    	let notice;

    	function action() {
    		Promise.resolve(onAction()).then(() => notice.close());
    	}

    	onMount(() => {
    		if (typeof onAction !== 'function') throw new Error(`onAction ${onAction} is not a function`);
    	});

    	function notice_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			notice = $$value;
    			$$invalidate(3, notice);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('message' in $$new_props) $$invalidate(0, message = $$new_props.message);
    		if ('duration' in $$new_props) $$invalidate(7, duration = $$new_props.duration);
    		if ('position' in $$new_props) $$invalidate(8, position = $$new_props.position);
    		if ('type' in $$new_props) $$invalidate(9, type = $$new_props.type);
    		if ('background' in $$new_props) $$invalidate(1, background = $$new_props.background);
    		if ('actionText' in $$new_props) $$invalidate(2, actionText = $$new_props.actionText);
    		if ('onAction' in $$new_props) $$invalidate(10, onAction = $$new_props.onAction);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		fly,
    		fade,
    		Notice,
    		filterProps,
    		message,
    		duration,
    		position,
    		type,
    		background,
    		actionText,
    		onAction,
    		notice,
    		action,
    		props,
    		newType
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    		if ('message' in $$props) $$invalidate(0, message = $$new_props.message);
    		if ('duration' in $$props) $$invalidate(7, duration = $$new_props.duration);
    		if ('position' in $$props) $$invalidate(8, position = $$new_props.position);
    		if ('type' in $$props) $$invalidate(9, type = $$new_props.type);
    		if ('background' in $$props) $$invalidate(1, background = $$new_props.background);
    		if ('actionText' in $$props) $$invalidate(2, actionText = $$new_props.actionText);
    		if ('onAction' in $$props) $$invalidate(10, onAction = $$new_props.onAction);
    		if ('notice' in $$props) $$invalidate(3, notice = $$new_props.notice);
    		if ('props' in $$props) $$invalidate(4, props = $$new_props.props);
    		if ('newType' in $$props) $$invalidate(5, newType = $$new_props.newType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 512) {
    			// $: newBackground = background
    			$$invalidate(5, newType = type && type.replace(/^is-(.*)/, 'has-text-$1'));
    		}

    		$$invalidate(4, props = {
    			...filterProps($$props),
    			position,
    			duration
    		});
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		message,
    		background,
    		actionText,
    		notice,
    		props,
    		newType,
    		action,
    		duration,
    		position,
    		type,
    		onAction,
    		notice_1_binding
    	];
    }

    class Snackbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			message: 0,
    			duration: 7,
    			position: 8,
    			type: 9,
    			background: 1,
    			actionText: 2,
    			onAction: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Snackbar",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[0] === undefined && !('message' in props)) {
    			console.warn("<Snackbar> was created without expected prop 'message'");
    		}
    	}

    	get message() {
    		throw new Error_1("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error_1("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error_1("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error_1("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error_1("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error_1("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error_1("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error_1("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get background() {
    		throw new Error_1("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error_1("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actionText() {
    		throw new Error_1("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actionText(value) {
    		throw new Error_1("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onAction() {
    		throw new Error_1("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onAction(value) {
    		throw new Error_1("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Snackbar.create = create$1;

    function create$1(props) {
      if (typeof props === 'string') props = { message: props };

      const snackbar = new Snackbar({
        target: document.body,
        props,
        intro: true,
      });

      snackbar.$on('destroyed', snackbar.$destroy);

      return snackbar;
    }

    var css_248z$5 = "";
    styleInject(css_248z$5);

    var css_248z$4 = "";
    styleInject(css_248z$4);

    var css_248z$3 = "";
    styleInject(css_248z$3);

    var css_248z$2 = "";
    styleInject(css_248z$2);

    /* node_modules/svelma/src/components/Toast/Toast.svelte generated by Svelte v3.48.0 */
    const file$1 = "node_modules/svelma/src/components/Toast/Toast.svelte";

    // (49:0) <Notice {...filterProps($$props)}>
    function create_default_slot$1(ctx) {
    	let div1;
    	let div0;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$1, 50, 4, 1498);
    			attr_dev(div1, "class", div1_class_value = "toast " + /*type*/ ctx[1] + " " + /*newBackground*/ ctx[2] + " svelte-1ahpku3");
    			attr_dev(div1, "role", "alert");
    			add_location(div1, file$1, 49, 2, 1438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = /*message*/ ctx[0];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 1) div0.innerHTML = /*message*/ ctx[0];
    			if (dirty & /*type, newBackground*/ 6 && div1_class_value !== (div1_class_value = "toast " + /*type*/ ctx[1] + " " + /*newBackground*/ ctx[2] + " svelte-1ahpku3")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(49:0) <Notice {...filterProps($$props)}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let notice;
    	let current;
    	const notice_spread_levels = [filterProps(/*$$props*/ ctx[3])];

    	let notice_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < notice_spread_levels.length; i += 1) {
    		notice_props = assign(notice_props, notice_spread_levels[i]);
    	}

    	notice = new Notice({ props: notice_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(notice.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(notice, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const notice_changes = (dirty & /*filterProps, $$props*/ 8)
    			? get_spread_update(notice_spread_levels, [get_spread_object(filterProps(/*$$props*/ ctx[3]))])
    			: {};

    			if (dirty & /*$$scope, type, newBackground, message*/ 39) {
    				notice_changes.$$scope = { dirty, ctx };
    			}

    			notice.$set(notice_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notice.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notice.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notice, detaching);
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
    	let newBackground;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toast', slots, []);
    	let { message } = $$props;
    	let { type = 'is-dark' } = $$props;
    	let { background = '' } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('message' in $$new_props) $$invalidate(0, message = $$new_props.message);
    		if ('type' in $$new_props) $$invalidate(1, type = $$new_props.type);
    		if ('background' in $$new_props) $$invalidate(4, background = $$new_props.background);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		fly,
    		fade,
    		Notice,
    		filterProps,
    		message,
    		type,
    		background,
    		newBackground
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ('message' in $$props) $$invalidate(0, message = $$new_props.message);
    		if ('type' in $$props) $$invalidate(1, type = $$new_props.type);
    		if ('background' in $$props) $$invalidate(4, background = $$new_props.background);
    		if ('newBackground' in $$props) $$invalidate(2, newBackground = $$new_props.newBackground);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*background, type*/ 18) {
    			$$invalidate(2, newBackground = background || type.replace(/^is-(.*)/, 'has-background-$1'));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [message, type, newBackground, $$props, background];
    }

    class Toast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { message: 0, type: 1, background: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toast",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[0] === undefined && !('message' in props)) {
    			console.warn("<Toast> was created without expected prop 'message'");
    		}
    	}

    	get message() {
    		throw new Error("<Toast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Toast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Toast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Toast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get background() {
    		throw new Error("<Toast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error("<Toast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Toast.create = create;

    function create(props) {
      if (typeof props === 'string') props = { message: props };

      const toast = new Toast({
        target: document.body,
        props,
        intro: true,
      });

      toast.$on('destroyed', toast.$destroy);

      return toast;
    }

    var css_248z$1 = "";
    styleInject(css_248z$1);

    var css_248z = "";
    styleInject(css_248z);

    /* src/App.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (87:1) <Button type="is-primary" on:click={handleUpload} disabled={uploadDisabled}   >
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Upload files");
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(87:1) <Button type=\\\"is-primary\\\" on:click={handleUpload} disabled={uploadDisabled}   >",
    		ctx
    	});

    	return block;
    }

    // (91:1) {#if progress.loading}
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let circle2;
    	let t0;
    	let div1;
    	let progress_1;
    	let t1_value = /*progress*/ ctx[1].percentage + "";
    	let t1;
    	let t2;
    	let progress_1_value_value;
    	let current;

    	circle2 = new Circle2({
    			props: {
    				size: "60",
    				color: "#FF3E00",
    				unit: "px",
    				duration: "1s"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(circle2.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			progress_1 = element("progress");
    			t1 = text(t1_value);
    			t2 = text("%");
    			attr_dev(div0, "class", "column is-1");
    			add_location(div0, file, 92, 3, 2141);
    			attr_dev(progress_1, "class", "progress is-primary");
    			progress_1.value = progress_1_value_value = /*progress*/ ctx[1].percentage;
    			attr_dev(progress_1, "max", "100");
    			add_location(progress_1, file, 96, 4, 2271);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file, 95, 3, 2246);
    			attr_dev(div2, "class", "columns is-vcentered");
    			add_location(div2, file, 91, 2, 2103);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(circle2, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, progress_1);
    			append_dev(progress_1, t1);
    			append_dev(progress_1, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*progress*/ 2) && t1_value !== (t1_value = /*progress*/ ctx[1].percentage + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*progress*/ 2 && progress_1_value_value !== (progress_1_value_value = /*progress*/ ctx[1].percentage)) {
    				prop_dev(progress_1, "value", progress_1_value_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(circle2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(91:1) {#if progress.loading}",
    		ctx
    	});

    	return block;
    }

    // (109:3) {#each files.accepted as item}
    function create_each_block_1(ctx) {
    	let li;
    	let fa;
    	let t0;
    	let t1_value = /*item*/ ctx[12].name + "";
    	let t1;
    	let current;
    	fa = new Fa({ props: { icon: faFile }, $$inline: true });

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(fa.$$.fragment);
    			t0 = space();
    			t1 = text(t1_value);
    			add_location(li, file, 109, 4, 2531);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(fa, li, null);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*files*/ 1) && t1_value !== (t1_value = /*item*/ ctx[12].name + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(fa);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(109:3) {#each files.accepted as item}",
    		ctx
    	});

    	return block;
    }

    // (115:1) {#if !progress.loading && results.urls.length > 0}
    function create_if_block(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let button;
    	let t2;
    	let div0;
    	let ul;
    	let current;

    	button = new Button({
    			props: {
    				type: "is-primary",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*copyURLs*/ ctx[7]);
    	let each_value = /*results*/ ctx[3].urls;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Broken URLs";
    			t1 = space();
    			create_component(button.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-27x8m3");
    			add_location(h2, file, 116, 3, 2676);
    			add_location(ul, file, 121, 4, 2793);
    			attr_dev(div0, "class", "box");
    			add_location(div0, file, 120, 3, 2771);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file, 115, 2, 2655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			mount_component(button, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*ul_binding*/ ctx[8](ul);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*results*/ 8) {
    				each_value = /*results*/ ctx[3].urls;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
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
    			if (detaching) detach_dev(div1);
    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    			/*ul_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(115:1) {#if !progress.loading && results.urls.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (119:3) <Button type="is-primary" on:click={copyURLs}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Copy links");
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(119:3) <Button type=\\\"is-primary\\\" on:click={copyURLs}>",
    		ctx
    	});

    	return block;
    }

    // (123:5) {#each results.urls as url}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let code;
    	let t_value = /*url*/ ctx[9] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			code = element("code");
    			t = text(t_value);
    			add_location(code, file, 123, 24, 2878);
    			attr_dev(a, "href", a_href_value = /*url*/ ctx[9]);
    			add_location(a, file, 123, 10, 2864);
    			add_location(li, file, 123, 6, 2860);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, code);
    			append_dev(code, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*results*/ 8 && t_value !== (t_value = /*url*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (dirty & /*results*/ 8 && a_href_value !== (a_href_value = /*url*/ ctx[9])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(123:5) {#each results.urls as url}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let dropzone;
    	let t4;
    	let br0;
    	let t5;
    	let button;
    	let t6;
    	let br1;
    	let t7;
    	let t8;
    	let div;
    	let h2;
    	let t10;
    	let ul;
    	let t11;
    	let current;
    	dropzone = new Dropzone({ $$inline: true });
    	dropzone.$on("drop", /*handleFilesSelect*/ ctx[5]);

    	button = new Button({
    			props: {
    				type: "is-primary",
    				disabled: /*uploadDisabled*/ ctx[4],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*handleUpload*/ ctx[6]);
    	let if_block0 = /*progress*/ ctx[1].loading && create_if_block_1(ctx);
    	let each_value_1 = /*files*/ ctx[0].accepted;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block1 = !/*progress*/ ctx[1].loading && /*results*/ ctx[3].urls.length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "XLIFF URLs Validator";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Drop your .xliff files and retrieve a list of dead / broken URLs";
    			t3 = space();
    			create_component(dropzone.$$.fragment);
    			t4 = space();
    			br0 = element("br");
    			t5 = space();
    			create_component(button.$$.fragment);
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Files that will be uploaded";
    			t10 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "svelte-27x8m3");
    			add_location(h1, file, 81, 1, 1811);
    			add_location(p, file, 82, 1, 1842);
    			add_location(br0, file, 85, 1, 1958);
    			add_location(br1, file, 89, 1, 2070);
    			attr_dev(h2, "class", "svelte-27x8m3");
    			add_location(h2, file, 106, 2, 2449);
    			add_location(ul, file, 107, 2, 2488);
    			attr_dev(div, "class", "box");
    			add_location(div, file, 105, 1, 2429);
    			attr_dev(main, "class", "svelte-27x8m3");
    			add_location(main, file, 80, 0, 1803);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p);
    			append_dev(main, t3);
    			mount_component(dropzone, main, null);
    			append_dev(main, t4);
    			append_dev(main, br0);
    			append_dev(main, t5);
    			mount_component(button, main, null);
    			append_dev(main, t6);
    			append_dev(main, br1);
    			append_dev(main, t7);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t8);
    			append_dev(main, div);
    			append_dev(div, h2);
    			append_dev(div, t10);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(main, t11);
    			if (if_block1) if_block1.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};
    			if (dirty & /*uploadDisabled*/ 16) button_changes.disabled = /*uploadDisabled*/ ctx[4];

    			if (dirty & /*$$scope*/ 32768) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*progress*/ ctx[1].loading) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*progress*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t8);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*files, faFile*/ 1) {
    				each_value_1 = /*files*/ ctx[0].accepted;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!/*progress*/ ctx[1].loading && /*results*/ ctx[3].urls.length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*progress, results*/ 10) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropzone.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block0);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropzone.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(dropzone);
    			destroy_component(button);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
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
    	let uploadDisabled;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let brokenURLs;
    	let files = { accepted: [], rejected: [] };
    	let progress = { loading: false, percentage: 0 };
    	let results = { urls: [] };

    	function handleFilesSelect(e) {
    		const { acceptedFiles, fileRejections } = e.detail;
    		$$invalidate(0, files.accepted = [...files.accepted, ...acceptedFiles], files);
    		$$invalidate(0, files.rejected = [...files.rejected, ...fileRejections], files);
    	}

    	async function handleUpload(e) {
    		if (progress.loading) {
    			return;
    		}

    		$$invalidate(3, results.urls = [], results);
    		$$invalidate(1, progress.loading = true, progress);
    		$$invalidate(1, progress.percentage = 0, progress);
    		let fileCount = 0;
    		let fileTotal = files.accepted.length;

    		function markCompleted() {
    			fileCount += 1;
    			$$invalidate(1, progress.percentage = fileCount / fileTotal * 100, progress);

    			if (fileCount == fileTotal) {
    				$$invalidate(1, progress.loading = false, progress);
    			}
    		}

    		for (let file of files.accepted) {
    			let fileContent = await file.text();

    			axios.post("https://alphabetsxyptiysl-xliff.functions.fnc.fr-par.scw.cloud", { xliff_content: fileContent }).then(resp => {
    				console.log("OK");
    				console.log("Response", resp);

    				for (var [url, valid] of Object.entries(resp.data.urls)) {
    					console.log(url, valid);

    					if (!valid) {
    						if (!results.urls.includes(url)) {
    							$$invalidate(3, results.urls = [...results.urls, url], results);
    						}
    					}
    				}

    				markCompleted();
    			});
    		}
    	}

    	function copyURLs() {
    		window.getSelection().selectAllChildren(brokenURLs);
    		document.execCommand("copy");
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			brokenURLs = $$value;
    			$$invalidate(2, brokenURLs);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Dropzone,
    		axios,
    		Circle2,
    		Fa,
    		faFile,
    		brokenURLs,
    		files,
    		progress,
    		results,
    		handleFilesSelect,
    		handleUpload,
    		copyURLs,
    		Button,
    		uploadDisabled
    	});

    	$$self.$inject_state = $$props => {
    		if ('brokenURLs' in $$props) $$invalidate(2, brokenURLs = $$props.brokenURLs);
    		if ('files' in $$props) $$invalidate(0, files = $$props.files);
    		if ('progress' in $$props) $$invalidate(1, progress = $$props.progress);
    		if ('results' in $$props) $$invalidate(3, results = $$props.results);
    		if ('uploadDisabled' in $$props) $$invalidate(4, uploadDisabled = $$props.uploadDisabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*progress, files*/ 3) {
    			$$invalidate(4, uploadDisabled = progress.loading || files.accepted.length == 0);
    		}
    	};

    	return [
    		files,
    		progress,
    		brokenURLs,
    		results,
    		uploadDisabled,
    		handleFilesSelect,
    		handleUpload,
    		copyURLs,
    		ul_binding
    	];
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
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
