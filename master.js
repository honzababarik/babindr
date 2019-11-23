window.dvlt = {
  storage: {
    set: function (key, value) {
      // TODO
    },
    delete: function (key) {
      // TODO
    },
    getAll: function () {
      // TODO
    },
    get: function (key) {
      // TODO
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
  utils: {
    random: function (maxNumber) {
      return Math.floor(Math.random() * maxNumber);
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
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
    }
  }
}
