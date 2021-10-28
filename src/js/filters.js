angular.module('miller')
  .filter('prefixTemplate', function (RUNTIME) {
    return function (input) {
      return RUNTIME.static + input;
    };
  })
  .filter('bibtex', function(){
    return function (text) {
      return text? text.replace(/[\{\}]/g,''): '';
    };
  })
  /*

    usage: <div ng-class="{'newclass': (arr | inArray : value)}">Yay</div>
  */
  .filter('inArray', function(){
    return function(arr, value) {
      return Array.isArray(arr) && arr.indexOf(value) !== -1;
    };
  })
  .filter('smartUrl', function(){
    return function(text){
      return (text || '')
        .replace(/^https?:\/\/(www)?\.?([^\/]*)\/(.*)$/, function(m,www,domain,path){
          return domain + '/...'+ path.substr(-25);
        })
    }
  })
  .filter('multilanguage', function($rootScope) {
    return function(obj) {
      if(typeof obj != 'object')
        return obj;
      return obj[$rootScope.language]
    }
  })
  .filter('tokenize', function(){
    return function(text, maxwords) {
      if(!text)
        return "";
      var words = text.split(/(?!=\.\s)\s/);

      var sentence = _.take(words, maxwords).join(' ');
      if(sentence.length < text.length){
        if(!sentence.match(/\?\!\.$/)){
          sentence += ' '
        }

        sentence += '...'
      }
      // console.log(text, sentences);
      return sentence;
    }
  })
  .filter('coverage', function(){
    return function(cover, hifi){
      var url,
          _hifi = hifi == "hifi";

      if(typeof cover != 'object')
        return ''

      if(cover.data){
        if(_hifi){
          url = cover.data.media_url || _.get(cover, 'data.urls.Publishable') || cover.data.thumbnail_url || cover.data.preview || cover.data.url   || cover.attachment || cover.snapshot;
        } else {
          url = cover.data.thumbnail_url || cover.data.preview || _.get(cover, 'data.urls.Preview')  || cover.snapshot || cover.attachment || cover.data.url;
        }
      } else {
        url = _hifi? (cover.attachment || cover.snapshot): (cover.snapshot || cover.attachment);
      }
      return url;
    }
  })
  .filter('substr', function(){
    return function(text, start, end){
      return text.substr(start, end)
    }
  })
  /*
    Replace state name point with spaces, e.g. to get collection
  */
  .filter('statetoclass', function(){
    return function(text){
      return (text || '')
        .split('.').join(' ')
    }
  })
  /*
    Replace quotes
  */
  .filter('quotes', function(){
    return function(text, language){
      var st = {
        lq: {
          en_US: {
            '«':'“',
            '"':'“'
          },
          fr_FR: {
            '“':'«',
            '"':'«'
          }
        },
        rq: {
          en_US: {
            '»':'”',
            '"':'”'
          },
          fr_FR: {
            '”':'»',
            '"':'»'
          }
        }
      };
      if(!st.rq[language]){
        return text
      }
      return (text || '')
        .replace(/([\s,;\?\.\!\[\]\(\)])(["«“])([^"»”]*)(["»”])([\s,;\?\.\!\[\]\(\)])/g, function(m, left, lq, quote, rq, right){

          return [left, (st.lq[language][lq] || lq), quote, (st.rq[language][rq] || rq), right].join('')
        });
    }
  })
  /*
    Translit non ascii chars and uniform punctuations signs
  */
  .filter('slugify', function(){
    return function (text) {
      var strip  = /[^\w\s-]/g,
          hyphen = /[-\s]+/g,
          slug   = text.toLowerCase();

      var map = {
        from: 'àáäãâèéëêìíïîòóöôõùúüûñç·/_,:;',
        to  : 'aaaaaeeeeiiiiooooouuuunc------'
      };

      for (var i=0, j=map.from.length; i<j; i++) {
        slug = slug.replace(new RegExp(map.from.charAt(i), 'g'), map.to.charAt(i));
      }
      return slug.replace(strip, '').trim().replace(hyphen, '-');
    };
  });