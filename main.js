(function() {

  function forEachNode(arr, callback, scope) {
    for (var i = 0; i < arr.length; i++) {
      callback.call(scope, arr[i], i, arr);
    }
  }

  // debug
  window.shotgun = function() {

    forEachNode(
      (Math.random() > 0.5) ?
        document.querySelectorAll('ol > li:first-child > input[type="radio"]') :
        document.querySelectorAll('ol > li:last-child > input[type="radio"]'),
      ($el) => $el.click(),
    );
    document.querySelector('button[type="submit"]').click();
  };

  function processOuterOl($ol, questionNumber) {
    // questionNumber starts at 1 because humans read this
    // Convert to radio
    forEachNode(
      $ol.querySelectorAll("li > ol > li"),
      function($li, ii) {
        // fix ol type
        $li.parentElement.type = 'a';
        var code = '' + questionNumber + ('abcde'[ii]);

        var $input = document.createElement('input');
        $input.type = 'radio';
        $input.id = 'a' + code;
        $input.name = 'q' + questionNumber;
        $input.value = code;

        var $label = document.createElement('label');
        $label.htmlFor = 'a' + code;
        $label.innerText = $li.innerText;

        $li.innerHTML = $input.outerHTML + $label.outerHTML;
      }
    );

  }

  function main() {
    var $outerOls = document.querySelectorAll('#quiz > ol');
    forEachNode(
      $outerOls,
      function($ol, i) {
        var idx = $ol.start || ($ol.attributes || {}).start || i + 1;
        processOuterOl($ol, +idx);
      }
    );

    var $quiz = document.getElementById('quiz');
    var $submit = document.getElementById('form-submit');
    var $sheet = document.getElementById('score-sheet');
    $quiz.addEventListener('submit', function(e) {
      e.preventDefault();
      var form = new FormData($quiz);
      var items = Array.from(form.entries())

      if (items.length < $outerOls.length) {
        alert('Answer all the questions');
        return;
      }

      // Convert answers
      var answers = items.reduce(function(agg, cur) {
        if (cur[0][0] === 'q') {
          agg[cur[1]] = 1;
        }
        return agg;
      }, {});

      // Scroll to scores
      window.setTimeout(function() {
        document.getElementById('score-scroll').scrollIntoView(true);
      }, 1);

      // Build score dict and score them
      var scores = {};
      forEachNode(
        $sheet.querySelectorAll('p'),
        function($p) {
          var theScore = 0;

          var newHtml = $p.innerHTML.replace(/\d+[ab]/g, function(g2) {
            if (answers.hasOwnProperty(g2)) {
              g2 = '<span style="color:green;">' + g2 + '</span>';
              theScore++;
            } else {
              g2 = '<span style="color:red;">' + g2 + '</span>';
            }
            return g2;
          });
          newHtml = newHtml.replace(/(?:<br>)?(Total ... score:).*$/g, '<br>$1');
          newHtml += ' <span style="color:magenta;">' + theScore + '</span>';
          $p.innerHTML = newHtml;

          // Save
          var name = $p.querySelector('strong').innerText;
          scores[name] = theScore;
        }
      );

      var goodScore = scores['PmG'] + scores['PvG'] + scores['PsG'];
      var badScore = scores['PmB'] + scores['PvB'] + scores['PsB'];
      var overallScore = Math.abs(goodScore - badScore);
      var hopeScore = scores['PmB'] + scores['PvB'];

      var goodText = goodScore >= 20 ? '20 and above you think about good events very optimistically' :
        goodScore >= 17 ? '17 - 19 your thinking is moderately optimistic' :
          goodScore >= 14 ? '14 - 16 is about average' :
            goodScore >= 11 ? '11 - 13 indicated that you think quite pessimistically' :
              'Anything 10 or less indicates great pessimism';

      var badText = badScore > 14 ? 'Anything above 14 is very pessimistic' :
        badScore >= 12 ? '12 - 14 is moderately pessimistic' :
          badScore >= 10 ? '10 - 11 is about average' :
            badScore >= 6 ? '6 - 9 you are moderately optimistic' :
              '3 - 6 you are marvelously optimistic about bad events';

      var overallText = overallScore > 8 ? 'Above 8, you are very optimistic' :
        overallScore >= 6 ? '6 - 8 is moderately optimistic' :
          overallScore >= 3 ? '3 - 5 is average' :
            overallScore >= 2 ? '1 - 2 is moderately pessimistic' :
              'A score of 0 and below is very pessimistic';

      var hopeText = hopeScore > 12 ? 'Above 12, you tend to feel very hopeless' :
        hopeScore >= 9 ? '9-11 is moderately hopeless' :
          hopeScore >= 7 ? '7 - 8 is average hopefulness' :
            hopeScore >= 3 ? '3 - 6 is moderately hopeful' :
              '0 - 2 is extraordinarily hopeful';

      var summary = [
        ['Good event score', goodScore, goodText],
        ['Bad event score', badScore, badText],
        ['Overall score', overallScore, overallText],
        ['Hopefulness score', hopeScore, hopeText],
      ].reduce(function(agg, cc) {
        return agg + '<div style="margin-bottom: 0.5em;">' +
          '<b>' + cc[0] + ': ' +
          '<span style="color:magenta;">' + cc[1] + '</span>' +
          '</b>' +
          '<div style="padding-left: 40px;">' + cc[2] + '</div>' +
          '</div>';
      }, '');
      document.getElementById('summary').innerHTML = summary;

      [
        ['.put-good-score', goodScore],
        ['.put-bad-score', badScore],
        ['.put-overall-score', overallScore],
        ['.put-hope-score', hopeScore],
      ].forEach(function(a) {
        forEachNode(
          document.querySelectorAll(a[0]),
          function($el) {
            $el.innerHTML = '<span style="color:magenta;">' + a[1] + '</span>';
          }
        );
      });

      console.log(goodScore + badScore + overallScore + hopeScore, $outerOls.length);

    });
  }

  main();
})();
