

window.dvlt = {
  data: {
    maleEmojis: ["👼", "🦸‍♂️", "🦹‍♂️", "👮‍♂️", "👷‍♂️", "💂‍♂️", "🕵️‍♂️", "👨‍⚕️", "👨‍🌾", "👨‍🍳", "👨‍🎓", "👨‍🎤", "👨‍🏫", "👨‍🏭", "👨‍💻", "👨‍💼", "👨‍🔧", "👨‍🔬", "👨‍🎨", "👨‍🚒", "👨‍✈️", "👨‍🚀", "👨‍⚖️", "🤵", "🤴", "🎅", "🧙‍♂️", "🧝‍♂️", "🧛‍♂️", "🧟‍♂️", "🧞‍♂️", "🧜‍♂️", "🧚‍♂️"],
    femaleEmojis: ["👼", "🦸‍♀️", "🦹‍♀️", "👮‍♀️", "👷‍♀️", "💂‍♀️", "🕵️‍♀️", "👩‍⚕️", "👩‍🌾", "👩‍🍳", "👩‍🎓", "👩‍🎤", "👩‍🏫", "👩‍🏭", "👩‍💻", "👩‍💼", "👩‍🔧", "👩‍🔬", "👩‍🎨", "👩‍🚒", "👩‍✈️", "👩‍🚀", "👩‍⚖️", "👰", "👸", "🤶", "🧙‍♀️", "🧝‍♀️", "🧛‍♀️", "🧟‍♀️", "🧞‍♀️", "🧜‍♀️", "🧚‍♀️"],
  },
  clock: {
    now: function () {
      return new Date().getTime();
    }
  },
  redirect: {
    url: function (url) {
      window.location.href = url;
    },
  },
  formatter: {
    toPerc: function (number) {
      return Math.floor(number * 100) + '%';
    }
  },
  storage: {
    set: function (key, value, sync) {
      sync = sync || false;
      if (sync) {
        firebase.database().ref(key).set(value);
      }
      return localStorage.setItem(key, JSON.stringify(value));
    },
    delete: function (key, sync) {
      sync = sync || false;
      if (sync) {
        firebase.database().ref(key).remove();
      }
      return localStorage.removeItem(key);
    },
    getAll: function (prefix) {
      var values = [];
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (!prefix || keys[i].startsWith(prefix)) {
          values.push(dvlt.storage.get(keys[i]));
        }
      }
      return values;
    },
    get: function (key, sync, callback) {
      sync = sync || false;
      if (sync && callback) {
        firebase.database().ref(key).once('value', function (snapshot) {
          var value = snapshot.val();
          dvlt.storage.set(key, value, false);
          callback(value);
        });
      }
      else {
        var item = localStorage.getItem(key);
        return JSON.parse(item);
      }
    }
  },
  notify: function (text, type, options) {
    var defaultOptions = {
      text: text,
      type: type,
      timeout: 5000,
    };
    options = options || {};
    type = type || 'success';
    new Noty(Object.assign(defaultOptions, options)).show();
  },
  array: {
    joinProps: function (arr, propName, separator) {
      var items = [];
      for (var i = 0; i < arr.length; i++) {
        items.push(arr[i][propName]);
      }
      return items.join(separator);
    },
  },
  utils: {
    random: function (maxNumber) {
      return Math.floor(Math.random() * maxNumber);
    },
    randomMaleEmoji: function () {
      return dvlt.data.maleEmojis[dvlt.utils.random(dvlt.data.maleEmojis.length - 1)];
    },
    randomFemaleEmoji: function () {
      return dvlt.data.femaleEmojis[dvlt.utils.random(dvlt.data.femaleEmojis.length - 1)];
    },
    randomEmoji: function () {
      var emojis = dvlt.data.maleEmojis.concat(dvlt.data.femaleEmojis);
      return emojis[dvlt.utils.random(emojis.length - 1)];
    },
    isMobile: function () {
      return window.innerWidth <= 768;
    },
    uuid: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    getUrlParameter: function(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },
  },
  string: {
    capitalize: function (word) {
      return word[0].toUpperCase() + word.slice(1);
    },
    randomName: function () {
      var adjectives = ["adamant", "adroit", "amatory", "animistic", "antic", "arcadian", "baleful", "bellicose", "bilious", "boorish", "calamitous", "caustic", "cerulean", "comely", "concomitant", "contumacious", "corpulent", "crapulous", "defamatory", "didactic", "dilatory", "dowdy", "efficacious", "effulgent", "egregious", "endemic", "equanimous", "execrable", "fastidious", "feckless", "fecund", "friable", "fulsome", "garrulous", "guileless", "gustatory", "heuristic", "histrionic", "hubristic", "incendiary", "insidious", "insolent", "intransigent", "inveterate", "invidious", "irksome", "jejune", "jocular", "judicious", "lachrymose", "limpid", "loquacious", "luminous", "mannered", "mendacious", "meretricious", "minatory", "mordant", "munificent", "nefarious", "noxious", "obtuse", "parsimonious", "pendulous", "pernicious", "pervasive", "petulant", "platitudinous", "precipitate", "propitious", "puckish", "querulous", "quiescent", "rebarbative", "recalcitant", "redolent", "rhadamanthine", "risible", "ruminative", "sagacious", "salubrious", "sartorial", "sclerotic", "serpentine", "spasmodic", "strident", "taciturn", "tenacious", "tremulous", "trenchant", "turbulent", "turgid", "ubiquitous", "uxorious", "verdant", "voluble", "voracious", "wheedling", "withering", "zealous"];
      var nouns = ["ninja", "chair", "pancake", "statue", "unicorn", "rainbows", "laser", "senor", "bunny", "captain", "nibblets", "cupcake", "carrot", "gnomes", "glitter", "potato", "salad", "toejam", "curtains", "beets", "toilet", "exorcism", "dragons", "jellybeans", "snakes", "dolls", "bushes", "cookies", "apples", "ukulele", "kazoo", "banjo", "circus", "trampoline", "carousel", "carnival", "locomotive", "animator", "artisan", "artist", "colorist", "inker", "coppersmith", "director", "designer", "flatter", "stylist", "leadman", "limner", "model", "musician", "penciller", "producer", "scenographer", "silversmith", "teacher", "beader", "foreman", "mechanic", "miller", "moldmaker", "beater", "patternmaker", "operator", "plumber", "sawfiler", "foreman", "soaper", "engineer", "wheelwright", "woodworkers"];
      return dvlt.string.capitalize(adjectives[dvlt.utils.random(adjectives.length - 1)]) + dvlt.string.capitalize(nouns[dvlt.utils.random(nouns.length - 1)]);
    },
  },
  ajax: {
    getJSON: function (url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        callback(xhr.status, xhr.response);
      };
      xhr.send();
    }
  }
}
