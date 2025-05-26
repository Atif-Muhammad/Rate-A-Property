const { PythonShell } = require('python-shell');

function analyzeSentiment(text) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: 'python',
    };

    const pyshell = new PythonShell('./SentimentPython/sentiment.py', options);
    let output = '';

    pyshell.on('message', (message) => {
      output += message;
    });

    pyshell.on('stderr', (stderr) => {
      console.error('PYTHON STDERR:', stderr);
    });

    // Send the text
    pyshell.send(text);

    // End the shell and handle the result
    pyshell.end((err) => {
      if (err) return reject(err);

      try {
        const sentiment = JSON.parse(output);
        resolve(sentiment);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

module.exports = analyzeSentiment;