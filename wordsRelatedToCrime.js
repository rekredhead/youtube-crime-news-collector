// Do not remove the current existing words
// Adding more words slows down the app since each videoData fetched, has to be filtered through this list

const wordsRelatedToCrime = [
   "shot", "shoot", "kill", "crime", "suspect", "dead", "stab", "death", "murder",
   "attack", "teen", "injure", "rob", "stole", "thief", "charge", "melee", "erupt",
   "fatal", "spree", "thieves", "gun", "knife", "caught", "arrest", "theft", "battle",
   "incident", "carjack", "assault", "die", "homicide", "hit", "jailed", "youth", "hate",
   "drug", "fire", "rage", "sentence", "steal", "violence", "wound", "kidnap", "invasion",
   "fight", "arson", "burglar", "machete", "rape", "violent", "invade", "damage",
   "beat", "rampage", "break", "suicide", "homeless", "crash", "car",
   "housing", "costofliving", "injury", "hijack"
];

module.exports = wordsRelatedToCrime;