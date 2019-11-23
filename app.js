(function () {
  var SCREEN_NAME_MENU = 'menu';
  var SCREEN_NAME_GAME_SETTINGS = 'game-settings';
  var SCREEN_NAME_GAME = 'game';
  var SCREEN_NAME_LOAD_GAMES = 'load-game';
  var STORAGE_SAVE_GAME_PREFIX = 'game-';
  var NEW_GAME_STATE = {
    players: [],
    nameSetUrl: null,
    currentPlayerIndex: 0,
    words: [],
    lastName: '',
  };

  var createNewGame = function () {
    return Object.assign({
      id: dvlt.utils.random(1000000),
    }, NEW_GAME_STATE);
  };

  new Vue({
    el: '#app',
    data: {
      currentScreen: SCREEN_NAME_MENU,
      // currentScreen: SCREEN_NAME_GAME_SETTINGS,
      isLoading: false,
      game: NEW_GAME_STATE,
      nameSets: [
        { url: '/data/boys-original.json', name: 'Boys - Original' },
      ],
      savedGames: [],
    },
    methods: {
      goToScreen: function (screenName) {
        this.currentScreen = screenName;
      },
      onClickStartGame: function () {
        this.game = createNewGame();
        this.goToScreen(SCREEN_NAME_GAME_SETTINGS);
      },
      onClickAddPlayer: function () {
        this.game.players.push(dvlt.string.randomName());
      },
      onClickRemovePlayer: function (index) {
        this.game.players.splice(index, 1);
      },
      onClickPlay: function () {
        var app = this;
        if (this.game.players.length < 2) {
          dvlt.notify('You need to select at least two players!', 'warning');
          return;
        }
        if (!this.game.nameSetUrl) {
          dvlt.notify('You need to select a name set!', 'warning');
          return;
        }

        this.isLoading = true;
        dvlt.ajax.getJSON(this.game.nameSetUrl, function (statusCode, response) {
          console.log(statusCode, response);
          // TODO this.game.words =
          app.isLoading = false;
          app.goToScreen(SCREEN_NAME_GAME);
        });

      },
      onClickBackToMenu: function () {
        this.goToScreen(SCREEN_NAME_MENU);
      },
      onClickSaveGame: function () {
        // TODO store to local storage
        // TODO show notification
      },
      onClickLoadGame: function () {
        this.goToScreen(SCREEN_NAME_LOAD_GAMES);
      },
      loadSavedGames: function () {
        // TODO lookup in localStorage
        this.savedGames = [];
      },
      onClickDeleteSaveGame: function (index) {
        // TODO confirm
        // TODO delete from savedGames and localStorage
      },
    },
    mounted: function () {
      this.loadSavedGames();
    }
  });

})();
