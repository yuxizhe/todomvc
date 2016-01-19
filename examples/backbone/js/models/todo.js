/*global Backbone */
var app = app || {};

(function() {
    'use strict';

    // Todo Model
    // ----------

    // Our basic **Todo** model has `title`, `order`, and `completed` attributes.
    app.Todo = Backbone.Model.extend({
        // Default attributes for the todo
        // and ensure that each todo created has `title` and `completed` keys.
        // 设置defaults 之后 可以保证每个都有这两个属性       并不是class ,todo-view 里有通过判断这个添加 class 的语句  this.$el.toggleClass('completed', this.model.get('completed')); 
        defaults: {
            title: '',
            completed: false
        },

        // Toggle the `completed` state of this todo item.
        toggle: function() {
            this.save({ // 保存 completed 的属性   保存就用save
                completed: !this.get('completed')
            });
        }
    });
})();
