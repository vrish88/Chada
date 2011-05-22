//
//Views
//

var md = new Showdown.converter();

$.SyntaxHighlighter.init({
  theme: 'Google',
  lineNumbers: false
});


var ChatView = Backbone.View.extend({
    tagName: 'li',

    initialize: function(options) {
        _.bindAll(this, 'render');
        this.model.bind('all', this.render);
    },

    render: function() {
        var content = '<div class="nick">' + this.model.get("name") + ': </div>'
        + '<div class="msg-text">' + md.makeHtml(this.model.get("text")) + '</div>'
        ;
        
        $(this.el).html(content)
        .addClass('message')
        .syntaxHighlight();

        return this;
    }
});

var ClientCountView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
        this.model.bind('all', this.render);
    }
    , render: function() {
        this.el.html(this.model.get("clients"));
        return this;
    }
});

var NodeChatView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'sendMessage');
        this.model.chats.bind('add', this.addChat);
        this.socket = options.socket;
        this.clientCountView = new ClientCountView({model: new models.ClientCountModel(), el: $('#client_count')});

        $("#entry").keypress(function (e) {
          if (e.keyCode != 13 || e.shiftKey) return;
          $('#messageForm').submit();
        });
        $('#entry').autoResize();
    }

    , events: {
        "submit #messageForm" : "sendMessage"
    }

    , addChat: function(chat) {
        var view = new ChatView({model: chat});
        $('#chat_list').append(view.render().el);
    }

    , msgReceived: function(message){
        switch(message.event) {
            case 'initial':
                this.model.mport(message.data);
                break;
            case 'chat':
                var newChatEntry = new models.ChatEntry();
                newChatEntry.mport(message.data);
                this.model.chats.add(newChatEntry);
                this.scrollDown();
                break;
            case 'update':
                log('count received' + message.data);
                this.clientCountView.model.updateClients(message.data);
                break;
        }
    }

    , sendMessage: function(){
        var inputField = $('textarea[name=message]');
        var chatEntry = new models.ChatEntry({text: inputField.val()});
        this.socket.send(chatEntry.xport());
        inputField.val('');
    }

    , scrollDown: function() {
        window.scrollBy(0, 100000000000000000);
        $("#entry").focus();
    }
});
