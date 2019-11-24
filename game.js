(function () {
  var STORAGE_SAVE_GAME_PREFIX = 'games/';

  new Vue({
    el: '#game',
    data: {
      gameId: null,
    },
    methods: {
      loadGame: function () {
        var app = this;
        dvlt.storage.get(STORAGE_SAVE_GAME_PREFIX + this.gameId, true, function (game) {
          if (game) {
            dvlt.redirect.url('/?g=' + app.gameId);
          }
          else {
            dvlt.redirect.url('/');
          }
        });
      }
    },
    mounted: function () {
      this.gameId = dvlt.utils.getUrlParameter('id');
      if (!this.gameId) {
        dvlt.redirect.url('/');
      }
      else {
        this.loadGame();
      }
    }
  });
})();
