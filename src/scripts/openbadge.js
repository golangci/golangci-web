var app = require('express')(),
    openBadge = require('openbadge');

/**
 * A simple badge using config defaults.
 * We only specify the text on the left and the text on the right
 */
app.get('/simple.svg', function (req, res) {
    openBadge({text: ['Go Code Quality', 'A+']}, function (err, badgeSvg) {
        /* TODO: Check for err */
        res.set('Content-Type', 'image/svg+xml');
        res.send(badgeSvg);
    });
});

/**
 * Changing fonts:
 * Example: Comic Sans. Just because you can, doesn't mean you should...
 */
app.get('/font.svg', function (req, res) {
    openBadge({text: ['Favorite Font', 'Comic Sans'], font: {fontFace: 'fonts/comic-sans/comic-sans.ttf'}}, function (err, badgeSvg) {
        /* TODO: Check for err */
        res.set('Content-Type', 'image/svg+xml');
        res.send(badgeSvg);
    });
});

/**
 * Changing Colors:
 * Individual control over both halves, the font and its dropshadow
 */
app.get('/colors.svg', function (req, res) {
    openBadge({text: ['GolangCI', 'A+'], color:{left:"#555",right:"#61CFDD"}}, function (err, badgeSvg) {

        /* TODO: Check for err */
        res.set('Content-Type', 'image/svg+xml');
        res.send(badgeSvg);
    });
});

app.get('/defaults.svg', function (req, res) {

    // Note: This is an exaggerated configuration showing all the defaults
    // In reality you *DON'T* needs to set all of these, and can get away
    // with just specifying the `text` parameter.

    var badgeConfig = {
        badge: 'baseBadge',                 // baseBadge is the only one we have for now.
        text: ['Hello', 'World'],           // Array with the copy on either side of the badge
        color: {
            left: '#555',                   // Background color on the left
            right: '#4c1',                  // Background color on the right
            font: '#fff',                   // Badge font color
            shadow: '#010101'               // Text shadow color. (Defaults to 0.3 opacity)
        },
        font: {
            fontFace: 'fonts/Open_Sans/OpenSans-Bold.ttf', // Path to the font to use.
            fontSize: 11                    // Font size in pixels
        },
        paddingX: 6,                       // Horizontal padding (in pixels) around text
        paddingY: 6                         // Vertical padding (in pixels) around text
    };

    openBadge(badgeConfig, function (err, badgeSvg) {
        /* TODO: Check for err */
        res.set('Content-Type', 'image/svg+xml');
        res.send(badgeSvg);
    });
});

app.get('/', function (req, res) {
    res.send(
        '<html>' +
        '<head>' +
        '<style>' +
        '   img {vertical-align: top} ' +
        '   * {line-height: 25px}' +
        '</style>' +
        '</head>' +
        '<body style="font-family: monospace">' +
        'A Basic Badge: <img src="simple.svg"/><br>' +
        'Changed Color: <img src="colors.svg"/><br>' +
        '</body>' +
        '</html>'
    )
});

app.listen(1337, function (err) {
    console.log('Listening on http://localhost:1337/');
});
