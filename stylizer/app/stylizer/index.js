const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const config = require('../../config.js');

const log = (msg) => {console.log("STYLIZER: ", msg)};

module.exports = {
  test: function(text) {
    return text;
  },
  
	// "Run" refers to a styling run
  startStyleVideo: async function(runParams) {
    log("VIDEOS!!!!");
    log(runParams);

    const options = [
      //stylizerPath + 'test.lua',
      'styVid.sh',
      runParams.contentPath,
      runParams.stylePath,
      `${config.outputPath}/${runParams.outputName}`,
      runParams.contentSize,
      runParams.styleSize
    ];

    log(`video ${runParams.upId} started`);
    log('bash' + options.join(' '));
    await execFile('bash', options, {'cwd': config.stylizerPath})
      .catch((err) => {
        log(`The following error occurred with user_photo_id ${runParams.upId}`);
        console.log(err);
        throw err;
      })
      .then((result) => {
        log(`Styling runId ${runParams.upId} completed succesfully.`);
      });
    log('done');
    return `${config.outputPath}/${runParams.outputName}`;
  }, 

  startStyle: async function(runParams) {

    const options = [
      //stylizerPath + 'test.lua',
      'test.lua',
      '-content', runParams.contentPath,
      '-contentSize', runParams.contentSize,
      '-style', runParams.stylePath,
      '-styleSize', runParams.styleSize,
      '-gpu', config.gpu,
      '-outputDir', config.outputPath,
      '-outputName', runParams.outputName
    ];

    log(`runId ${runParams.upId} started`);
    await execFile(config.thPath, options, {'cwd': config.stylizerPath})
      .catch((err) => {
        log(`The following error occurred with user_photo_id ${runParams.upId}`);
        console.log(err);
        throw err;
      })
      .then((result) => {
        log(`Styling runId ${runParams.upId} completed succesfully.`);
        execFile('rm', [runParams.contentPath, runParams.stylePath]);
      });
    return `${config.outputPath}/${runParams.outputName}`;
  }, 

  removeResource: function(path) {
    execFile('rm', [path]);
  }

}
