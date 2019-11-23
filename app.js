(function () {
  var SCREEN_NAME_MENU = 'menu';
  var SCREEN_NAME_GAME_SETTINGS = 'game-settings';
  var SCREEN_NAME_GAME = 'game';
  var SCREEN_NAME_LOAD_GAMES = 'load-game';
  var SCREEN_NAME_PLAYER_READY = 'player-ready';
  var SCREEN_NAME_RESULTS = 'results';
  var TAB_INDEX_MATCHES = 0;
  var TAB_INDEX_BEST_MATCHES = 1;
  var STORAGE_SAVE_GAME_PREFIX = 'game-';
  var NEW_GAME_STATE = {
    gender: null,
    players: [],
    lastName: '',
    nameSet: null,
    currentPlayerIndex: 0,
    currentWordIndex: 0,
    currentWordStartedAt: 0,
    currentEmoji: null,
    words: [],
    ratings: {},
    results: null,
  };

  var createNewGame = function () {
    return Object.assign({
      id: dvlt.utils.random(1000000),
      createdAt: dvlt.clock.now(),
    }, NEW_GAME_STATE);
  };

  new Vue({
    el: '#app',
    data: {
      currentScreen: SCREEN_NAME_MENU,
      isLoading: false,
      isHoldingUp: false,
      isHoldingDown: false,
      isDropdownOpened: false,
      areDetailsShown: false,
      currentTab: 0,
      nameSets: [
        { url: '/data/boys-original.json', name: 'Boys - Original [1000 names]' },
        { url: '/data/boys-simple.json', name: 'Boys - Original Simple [3 names]' },
      ],
      nameSetIndex: null,
      game: null,
      savedGames: [],
    },
    methods: {
      goToScreen: function (screenName) {
        if (screenName === SCREEN_NAME_MENU) {
          this.reset();
        }
        if (screenName === SCREEN_NAME_GAME) {
          this.currentWordStartedAt = dvlt.clock.now();
        }
        if (screenName === SCREEN_NAME_RESULTS && !this.game.results) {
          this.analyzeResults(this.game);
        }
        this.currentScreen = screenName;
      },
      reset: function () {
        this.game = null;
        this.nameSetIndex = null;
        this.savedGames = [];
        this.isDropdownOpened = false;
        this.areDetailsShown = false;
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
        if (this.nameSetIndex === null || this.nameSetIndex === undefined) {
          dvlt.notify('You need to select a name set!', 'warning');
          return;
        }

        this.game.nameSet = this.nameSets[this.nameSetIndex];
        this.isLoading = true;
        dvlt.ajax.getJSON(this.game.nameSet.url, function (statusCode, response) {
          app.game.words = response;
          app.isLoading = false;
          app.startGame();
        });
      },
      onClickBackToMenu: function () {
        this.goToScreen(SCREEN_NAME_MENU);
      },
      onClickSaveGame: function () {
        dvlt.storage.set(this.getGameStoreKey(this.game), this.game);
        dvlt.notify('Your game ' + this.game.id + ' was saved!', 'success')
        this.isDropdownOpened = false;
      },
      onClickExitGame: function () {
        if (confirm('Are you sure you want to exit game?')) {
          this.goToScreen(SCREEN_NAME_MENU);
        }
      },
      startGame: function () {
        this.goToScreen(SCREEN_NAME_GAME);
        this.nextWord(0);
      },
      onClickLoadGames: function () {
        this.loadSavedGames();
        this.goToScreen(SCREEN_NAME_LOAD_GAMES);
      },
      onClickLoadGame: function () {
        if (this.isGameCompleted(this.game)) {
          this.goToScreen(SCREEN_NAME_RESULTS);
        }
        else {
          this.goToScreen(SCREEN_NAME_GAME);
        }
      },
      loadSavedGames: function () {
        this.savedGames = dvlt.storage.getAll(STORAGE_SAVE_GAME_PREFIX);
      },
      onClickSavedGame: function (game) {
        this.game = game;
        if (dvlt.utils.isMobile()) {
          this.onClickLoadGame();
        }
      },
      onClickDeleteSaveGame: function (index, e) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this game?')) {
          var game = this.savedGames[index];
          this.savedGames.splice(index, 1);
          dvlt.storage.delete(this.getGameStoreKey(game));
          if (this.game && this.game.id === game.id) {
            this.game = null;
          };
        }
      },
      rateCurrentWord: function (rating) {
        if (!this.game.ratings[this.game.currentWordIndex]) {
          this.game.ratings[this.game.currentWordIndex] = {};
        }
        this.game.ratings[this.game.currentWordIndex][this.game.currentPlayerIndex] = {
          score: rating,
          time: dvlt.clock.now() - this.currentWordStartedAt,
        };
      },
      onClickSelectGender: function (gender) {
        this.game.gender = gender;
      },
      onClickRateUp: function () {
        this.onRateWord(1);
        this.isHoldingUp = false;
      },
      onClickRateDown: function () {
        this.onRateWord(-1);
        this.isHoldingDown = false;
      },
      nextWord: function (index) {
        var app = this;
        this.game.currentWordIndex = index;
        this.game.currentEmoji = this.getCurrentEmoji();
        Vue.nextTick(function () {
          app.currentWordStartedAt = dvlt.clock.now();
        });
      },
      nextPlayer: function () {
        this.game.currentPlayerIndex++;
        this.nextWord(0);
      },
      onRateWord: function (rating) {
        this.rateCurrentWord(rating);
        if (this.game.currentWordIndex < this.game.words.length - 1) {
          this.nextWord(this.game.currentWordIndex + 1);
        }
        else if (this.game.currentPlayerIndex < this.game.players.length - 1) {
          this.nextPlayer();
          this.goToScreen(SCREEN_NAME_PLAYER_READY);
        }
        else {
          this.onGameCompleted();
        }
      },
      onGameCompleted: function () {
        this.analyzeResults(this.game);
        this.onClickSaveGame();
        this.goToScreen(SCREEN_NAME_RESULTS);
      },
      analyzeResults: function (game) {
        var results = {
          players: {},
          words: {},
          general: {
            matches: 0
          },
        };
        var playerCount = this.game.players.length;

        for (var i = 0; i < Object.keys(game.ratings).length; i++) {
          var wordRatings = game.ratings[i];

          var score = 0;
          var likes = 0;
          var dislikes = 0;
          var totalTime = 0;

          for (var j = 0; j < Object.keys(wordRatings).length; j++) {
            if (!results.players[j]) {
              results.players[j] = {
                likes: 0,
                dislikes: 0,
                totalTime: 0,
              }
            }

            var rating = wordRatings[j];
            if (rating.score > 0) {
              results.players[j].likes++;
              likes++;
            }
            else {
              results.players[j].dislikes++;
              dislikes++;
            }
            results.players[j].totalTime += rating.time;
            totalTime += rating.time;
            score += rating.score;
          }

          results.words[i] = {
            score: score,
            likes: likes,
            dislikes: dislikes,
            totalTime: totalTime,
          };

          // If the score equals or is higher to the number of players rating
          // = Means everyone rated at least 1
          if (score === playerCount) {
            results.general.matches++;
          }
        }
        game.results = results;
      },
      getPlayerLikesRatio: function (player) {
        return dvlt.formatter.toPerc(player.likes / (player.likes + player.dislikes));
      },
      getPlayerDislikesRatio: function (player) {
        return dvlt.formatter.toPerc(player.dislikes / (player.likes + player.dislikes));
      },
      onClickPlayerReady: function () {
        this.goToScreen(SCREEN_NAME_GAME);
      },
      getGameName: function (game) {
        var lastPlayerIndex = game.players.length - 1;
        return game.players.slice(0, lastPlayerIndex).join(',') + ' and ' + game.players[lastPlayerIndex];
      },
      getCurrentEmoji: function () {
        if (this.game.gender === 'M') {
          return dvlt.utils.randomMaleEmoji();
        }
        else if (this.game.gender === 'F') {
          return dvlt.utils.randomFemaleEmoji();
        }
        return dvlt.utils.randomEmoji();
      },
      getGameStoreKey: function (game) {
        return STORAGE_SAVE_GAME_PREFIX + game.id;
      },
      getGameProgress: function (game) {
        // TODO on navigation, push states
        var totalWords = game.players.length * game.words.length;
        var currentWords = (game.currentWordIndex + 1) + (game.currentPlayerIndex * game.words.length);
        return dvlt.formatter.toPerc(currentWords / totalWords);
      },
      isGameCompleted: function (game) {
        var totalWords = game.players.length * game.words.length;
        var currentWords = (game.currentWordIndex + 1) + (game.currentPlayerIndex * game.words.length);
        return totalWords === currentWords;
      },
    },
    computed: {
      sortedMatches: function () {
        var matches = [];
        for (var i = 0; i < Object.keys(this.game.results.words).length; i++) {
          var wordRating = this.game.results.words[i];
          if (wordRating.score === this.game.players.length) {
            matches.push({
              word: this.game.words[i].name,
              rating: wordRating.score,
              time: wordRating.totalTime,
            });
          }
        }

        if (this.currentTab === TAB_INDEX_BEST_MATCHES) {
          matches.sort(function (m1, m2) {
            return m1.time - m2.time;
          });
        }
        return matches;
      },
      progressText: function () {
        return '[' + (this.game.currentWordIndex + 1) + ' / ' + this.game.words.length + ']';
      },
      playerProgress: function () {
        return Math.round(this.game.currentWordIndex / this.game.words.length * 100);
      },
      progressBarStyle: function () {
        return 'width: ' + this.playerProgress + '%';
      },
      currentPlayerName: function () {
        return this.game.players[this.game.currentPlayerIndex];
      },
      currentGameName: function () {
        return this.getGameName(this.game);
      },
      currentName: function () {
        return this.game.words[this.game.currentWordIndex].name;
      },
      isGameInProgress: function () {
        return this.game && this.currentScreen === SCREEN_NAME_GAME;
      },
    },
    mounted: function () {
      var app = this;
      document.addEventListener('keyup', function (e) {
        var keyCode = e.keyCode || e.which;
        if (app.isGameInProgress) {
          if (keyCode === 38) {
            app.onClickRateUp();
          }
          else if (keyCode === 40) {
            app.onClickRateDown();
          }
        }
      });
      document.addEventListener('keydown', function (e) {
        var keyCode = e.keyCode || e.which;
        if (app.isGameInProgress) {
          if (keyCode === 38) {
            app.isHoldingUp = true;
          }
          else if (keyCode === 40) {
            app.isHoldingDown = true;
          }
        }
      });
    }
  });

})();
