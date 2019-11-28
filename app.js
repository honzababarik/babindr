(function () {
  var SCREEN_NAME_MENU = 'menu';
  var SCREEN_NAME_GAME_SETTINGS = 'game-settings';
  var SCREEN_NAME_GAME = 'game';
  var SCREEN_NAME_LOAD_GAMES = 'load-game';
  var SCREEN_NAME_PLAYER_READY = 'player-ready';
  var SCREEN_NAME_RESULTS = 'results';
  var TAB_INDEX_MATCHES = 0;
  var TAB_INDEX_BEST_MATCHES = 1;
  var TAB_INDEX_LIKED = 2;
  var STORAGE_SAVE_GAME_PREFIX = 'games/';
  var NEW_GAME_STATE = {
    version: '1.0',
    gender: null,
    players: [],
    lastName: '',
    nameSet: null,
    currentPlayerIndex: 0,
    currentWordIndex: 0,
    currentWordStartedAt: 0,
    words: [],
    ratings: {},
    results: null,
  };

  var createNewGame = function () {
    return dvlt.dict.merge({
      id: dvlt.utils.uuid(),
      createdAt: dvlt.clock.now(),
    }, NEW_GAME_STATE);
  };

  new Vue({
    el: '#app',
    data: {
      currentScreen: SCREEN_NAME_MENU,
      currentEmoji: null,
      isLoading: false,
      isHoldingUp: false,
      isHoldingDown: false,
      isDropdownOpened: false,
      areDetailsShown: false,
      isSharingResults: false,
      currentTab: 0,
      nameSets: [
        { url: '/data/girls-original.json', name: 'Gigantic Set of Popular Girl Names', count: 1000 },
        { url: '/data/boys-original.json', name: 'Gigantic Set of Popular Boy Names', count: 1000 },
        { url: '/data/boys-100-popular-2018.json', name: 'Most Popular American Boy Names of 2018', count: 1000 },
        { url: '/data/girls-100-popular-2018.json', name: 'Most Popular American Girl Names of 2018', count: 1000 },

        { url: '/data/boys-simple.json', name: 'Boys - Testing Sample', count: 3 },
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
        dvlt.utils.setPageHash('');
      },
      onClickStartGame: function () {
        this.game = createNewGame();
        this.goToScreen(SCREEN_NAME_GAME_SETTINGS);
      },
      onClickAddPlayer: function () {
        this.game.players.push({
          name: dvlt.string.randomName()
        });
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

        var nameSet = this.nameSets[this.nameSetIndex];
        this.game.nameSet = this.getSetDisplayName(nameSet);
        this.isLoading = true;
        dvlt.ajax.getJSON(nameSet.url, function (statusCode, response) {
          app.game.words = response.names;
          app.isLoading = false;
          app.startGame();
        });
      },
      getSetDisplayName: function (nameSet) {
        return nameSet.name + ' [' + nameSet.count + ' names]';
      },
      onClickBackToMenu: function () {
        this.goToScreen(SCREEN_NAME_MENU);
      },
      onClickSaveGame: function () {
        this.isDropdownOpened = false;
        dvlt.storage.set(this.getGameStoreKey(this.game), this.game, true);
        dvlt.notify('Your game ' + this.game.id + ' was saved!', 'success')
        this.isDropdownOpened = false;
      },
      onClickExitGame: function () {
        this.isDropdownOpened = false;
        if (confirm('Are you sure you want to exit game?')) {
          this.goToScreen(SCREEN_NAME_MENU);
        }
      },
      startGame: function () {
        dvlt.utils.setPageHash(this.game.id);
        this.goToScreen(SCREEN_NAME_GAME);
        this.nextWord(0);
      },
      onClickLoadGames: function () {
        this.loadSavedGames();
        this.goToScreen(SCREEN_NAME_LOAD_GAMES);
      },
      onClickLoadGame: function () {
        dvlt.utils.setPageHash(this.game.id);
        if (this.isGameCompleted(this.game)) {
          this.goToScreen(SCREEN_NAME_RESULTS);
        }
        else {
          this.currentEmoji = this.getCurrentEmoji();
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
          dvlt.storage.delete(this.getGameStoreKey(game), true);
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
        this.currentEmoji = this.getCurrentEmoji();
        Vue.nextTick(function () {
          app.currentWordStartedAt = dvlt.clock.now();
        });
      },
      nextPlayer: function () {
        this.game.currentPlayerIndex++;
        this.nextWord(0);
        this.goToScreen(SCREEN_NAME_PLAYER_READY);
        this.onClickSaveGame();
      },
      onRateWord: function (rating) {
        this.rateCurrentWord(rating);
        if (this.game.currentWordIndex < this.game.words.length - 1) {
          this.nextWord(this.game.currentWordIndex + 1);
        }
        else if (this.game.currentPlayerIndex < this.game.players.length - 1) {
          this.nextPlayer();
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
        var playerCount = game.players.length;
        for (var i = 0; i < game.words.length; i++) {
          var wordRatings = game.ratings[i];

          var score = 0;
          var likes = 0;
          var dislikes = 0;
          var totalTime = 0;
          var shouldSkipWord = false;

          for (var j = 0; j < Object.keys(wordRatings).length; j++) {
            if (!results.players[j]) {
              results.players[j] = {
                likes: 0,
                dislikes: 0,
                totalTime: 0,
              }
            }

            var rating = wordRatings[j];
            if (!rating) {
              // One user rated but the other did not
              shouldSkipWord = true;
              continue;
            }

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

          if (!shouldSkipWord) {
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
        }
        game.results = results;
      },
      onClickSkipRest: function () {
        this.isDropdownOpened = false;
        var hasNextPlayer = this.game.currentPlayerIndex < this.game.players.length - 1;
        var confirmationMessage = 'Are you sure you want to skip the remaining words and jump to the next player?';
        if (!hasNextPlayer) {
          confirmationMessage = 'Are you sure you want to skip the remaining words and go to results?';
        }

        if (confirm(confirmationMessage)) {
          this.game.words.splice(this.game.currentWordIndex + 1);
          if (hasNextPlayer) {
            this.nextPlayer();
          }
          else {
            this.onGameCompleted();
          }
        }
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
        var players = game.players.slice(0, lastPlayerIndex);
        return dvlt.array.joinProps(players, 'name', ', ') + ' and ' + game.players[lastPlayerIndex].name;
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
        var totalGameWords = this.getTotalWords(game);
        var totalWords = game.players.length * totalGameWords;
        var currentWords = (game.currentWordIndex + 1) + (game.currentPlayerIndex * totalGameWords);
        return dvlt.formatter.toPerc(currentWords / totalWords);
      },
      isGameCompleted: function (game) {
        var totalGameWords = this.getTotalWords(game);
        var totalWords = game.players.length * totalGameWords;
        var currentWords = (game.currentWordIndex + 1) + (game.currentPlayerIndex * totalGameWords);
        return totalWords === currentWords;
      },
      getTotalWords: function (game) {
        return game.words.length;
      },
      getLikers: function (wordIndex) {
        var likers = [];
        var ratings = this.game.ratings[wordIndex];
        for (var i = 0; i < Object.keys(ratings).length; i++) {
          var rating = ratings[i];
          if (rating.score > 0) {
            likers.push(this.game.players[i].name);
          }
        }
        return likers;
      },
      onClickShareGame: function () {
        this.isSharingResults = !this.isSharingResults;
        this.areDetailsShown = false;
      },
      onClickShowDetails: function () {
        this.isSharingResults = false;
        this.areDetailsShown = !this.areDetailsShown;
      },
      onDocumentKeyUp: function (e) {
        var keyCode = e.keyCode || e.which;
        if (this.isGameInProgress) {
          if (keyCode === 38) {
            this.onClickRateUp();
          }
          else if (keyCode === 40) {
            this.onClickRateDown();
          }
        }
      },
      onDocumentKeyDown: function (e) {
        var keyCode = e.keyCode || e.which;
        if (this.isGameInProgress) {
          if (keyCode === 38) {
            this.isHoldingUp = true;
          }
          else if (keyCode === 40) {
            this.isHoldingDown = true;
          }
        }
      },
      onDocumentBodyClick: function (e) {
        if (this.isDropdownOpened && !this.$refs.dropdown.contains(e.target)) {
          this.isDropdownOpened = false;
        }
      },
    },
    computed: {
      gameUrl: function () {
        return 'https://babinder.com/game?id=' + this.game.id;
      },
      sortedMatches: function () {
        var matches = [];
        var scoreMinimum = this.game.players.length;
        if (this.currentTab === TAB_INDEX_LIKED) {
          // It doesnt have negative score, means that it had to be liked by 50% and more users
          scoreMinimum = 0;
        }

        for (var i = 0; i < Object.keys(this.game.results.words).length; i++) {
          var wordRating = this.game.results.words[i];
          if (wordRating.score >= scoreMinimum) {
            matches.push({
              word: this.game.words[i].name,
              score: wordRating.score,
              time: wordRating.totalTime,
              likers: this.getLikers(i).join(', '),
            });
          }
        }

        if (this.currentTab === TAB_INDEX_BEST_MATCHES) {
          matches.sort(function (m1, m2) {
            return m1.time - m2.time;
          });
        }
        else if (this.currentTab === TAB_INDEX_LIKED) {
          matches.sort(function (m1, m2) {
            var score = m2.score - m1.score;
            return score === 0 ? m1.time - m2.time : score;
          });
        }
        return matches;
      },
      progressText: function () {
        return '[' + (this.game.currentWordIndex + 1) + ' / ' + this.getTotalWords(this.game) + ']';
      },
      playerProgress: function () {
        return Math.round(this.game.currentWordIndex / this.game.words.length * 100);
      },
      progressBarStyle: function () {
        return 'width: ' + this.playerProgress + '%';
      },
      currentPlayerName: function () {
        return this.game.players[this.game.currentPlayerIndex].name;
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
    beforeDestroy: function () {
      document.removeEventListener('keyup', this.onDocumentKeyUp);
      document.removeEventListener('keydown', this.onDocumentKeyDown);
      document.removeEventListener('click', this.onDocumentBodyClick);
    },
    mounted: function () {
      document.addEventListener('keyup', this.onDocumentKeyUp);
      document.addEventListener('keydown', this.onDocumentKeyDown);
      document.body.addEventListener('click', this.onDocumentBodyClick);

      var gameId = dvlt.utils.getPageHash();
      if (gameId) {
        var game = dvlt.storage.get(STORAGE_SAVE_GAME_PREFIX + gameId);
        if (game) {
          this.game = game;
          this.onClickLoadGame();
        }
      }
    }
  });

})();
