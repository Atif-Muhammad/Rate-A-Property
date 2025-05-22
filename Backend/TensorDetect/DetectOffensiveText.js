
const leoProfanity = require("leo-profanity");

const detectOffensiveText = async (text) => {

    leoProfanity.loadDictionary(); 
    const isBad = leoProfanity.check(text);
    return isBad;
};


module.exports = detectOffensiveText;