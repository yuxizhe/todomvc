/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '.todoapp', // 绑定 indew.html 中的 大框 class：todoapp   el: '.todoapp'

        // Our template for the line of statistics at the bottom of the app.  状态统计用
        statsTemplate: _.template($('#stats-template').html()),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            'keypress .new-todo': 'createOnEnter',
            'click .clear-completed': 'clearCompleted',
            'click .toggle-all': 'toggleAllComplete'
        },

        // At initialization we bind to the relevant events on the `Todos`    listenTo 绑定
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        initialize: function() {
            this.allCheckbox = this.$('.toggle-all')[0]; //this.xxxxxx 和 this.$xxxxxxxx 的区别
            this.$input = this.$('.new-todo');
            this.$footer = this.$('.footer');
            this.$main = this.$('.main');
            this.$list = $('.todo-list');

            // app.todos 在 todos.js 中定义 是个 collection。 app.todos = new Todos();

            this.listenTo(app.todos, 'add', this.addOne);
            this.listenTo(app.todos, 'reset', this.addAll);
            this.listenTo(app.todos, 'change:completed', this.filterOne);
            this.listenTo(app.todos, 'filter', this.filterAll);
            this.listenTo(app.todos, 'all', _.debounce(this.render, 0));

            // Suppresses 'add' events with {reset: true} and prevents the app view
            // from being re-rendered for every model. Only renders when the 'reset'
            // event is triggered at the end of the fetch.
            app.todos.fetch({
                reset: true
            });
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
            var completed = app.todos.completed().length;
            var remaining = app.todos.remaining().length;

            if (app.todos.length) {
                this.$main.show();
                this.$footer.show();

                this.$footer.html(this.statsTemplate({
                    completed: completed,
                    remaining: remaining
                }));

                this.$('.filters li a')
                    .removeClass('selected')
                    .filter('[href="#/' + (app.TodoFilter || '') + '"]')
                    .addClass('selected');
            } else {
                this.$main.hide();
                this.$footer.hide();
            }

            this.allCheckbox.checked = !remaining;
        },

        // Add a single todo item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(todo) { // 这个todo 如何理解？  传入app.todos?   function的第一个参数就是model, function (model, value) 所以todo 代表app.todos的model
            var view = new app.TodoView({ // 调用todo-view.js 
                model: todo //这个model: todo 如何理解？  继承 app.todos 的model?
            });
            this.$list.append(view.render().el); // 这个负责页面的实际改变
        },

        // Add all items in the **Todos** collection at once.
        addAll: function() {
            this.$list.html(''); // 作用？ 输出空格？
            app.todos.each(this.addOne, this); //each 为什么两个参数？ dash中是一个参数。
        },

        filterOne: function(todo) {
            todo.trigger('visible');
        },

        filterAll: function() {
            app.todos.each(this.filterOne, this);
        },

        // Generate the attributes for a new Todo item.
        newAttributes: function() {
            return {
                title: this.$input.val().trim(),
                order: app.todos.nextOrder(),
                completed: false
            };
        },

        // If you hit return in the main input field, create new **Todo** model,
        // persisting it to *localStorage*.
        createOnEnter: function(e) {
            if (e.which === ENTER_KEY && this.$input.val().trim()) {
                app.todos.create(this.newAttributes()); // 添加model  
                this.$input.val(''); //清空输入区
            }
        },

        // Clear all completed todo items, destroying their models.
        clearCompleted: function() {
            _.invoke(app.todos.completed(), 'destroy');
            return false;
        },

        toggleAllComplete: function() {
            var completed = this.allCheckbox.checked;

            app.todos.each(function(todo) {
                todo.save({
                    completed: completed
                });
            });
        }
    });
})(jQuery);
