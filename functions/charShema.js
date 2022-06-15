const mongoose = require('mongoose')

const characterSchema = new mongoose.Schema({
    _id: {
        type: Object,
        required: true
    },
    alignment: {
        type: String
    },
    armourClass: {
        type: String
    },
    attacks: {
        type: String
    },
    background: {
        type: String
    },
    bonds: {
        type: String
    },
    charisma: {
        type: Number
    },
    charismaAtt: {
        type: Number
    },
    charismaSave: {
        type: Number
    },
    clas: {
        type: String
    },
    constitution: {
        type: Number
    },
    constitutionAtt: {
        type: Number
    },
    constitutionSave: {
        type: Number
    },
    cp: {
        type: Number
    },
    deathsaveFailures: {
        type: Number,
        default: 0
    },
    deathSaveSuccesses: {
        type: Number,
        default: 0
    },
    dexterity: {
        type: Number
    },
    dexterityAtt: {
        type: Number
    },
    dexteritySave: {
        type: Number
    },
    ep: {
        type: Number
    },
    equipment: {
        type: String
    },
    experiencePoints: {
        type: Number
    },
    faction: {
        type: String
    },
    featuresTraits: {
        type: String
    },
    flaws: {
        type: String
    },
    gp: {
        type: Number
    },
    hitPoints: {
        type: Number
    },
    history: {
        type: String
    },
    hitDice: {
        type: Number
    },
    ideals: {
        type: String
    },
    initiative: {
        type: Number
    },
    inspiration: {
        type: Number
    },
    intelligence: {
        type: Number
    },
    intelligenceAtt: {
        type: Number
    },
    intelligenceSave: {
        type: Number
    },
    level: {
        type: Number
    },
    maxHitPoints: {
        type: Number
    },
    name: {
        type: String
    },
    notes: {
        type: String
    },
    otherProficiencies: {
        type: String
    },
    owner: {
        type: String
    },
    passivePerception: {
        type: Number
    },
    personaility: {
        type: String
    },
    pp: {
        type: Number
    },
    proficiencyBonus: {
        type: Number
    },
    race: {
        type: String
    },
    skillAcrobatics: {
        type: Number
    },
    skillAnimalHandling: {
        type: Number
    },
    skillArcana: {
        type: Number
    },
    skillAthletics: {
        type: Number
    },
    skillDeception: {
        type: Number
    },
    skillHistory: {
        type: Number
    },
    skillInsight: {
        type: Number
    },
    skillIntimidation: {
        type: Number
    },
    skillInvestigation: {
        type: Number
    },
    skillMedicine: {
        type: Number
    },
    skillNature: {
        type: Number
    },
    skillPerception: {
        type: Number
    },
    skillPerformance: {
        type: Number
    },
    skillPersuasion: {
        type: Number
    },
    skillReligion: {
        type: Number
    },
    skillSleightOfHand: {
        type: Number
    },
    skillStealth: {
        type: Number
    },
    skillSurvival: {
        type: Number
    },
    sp: {
        type: Number
    },
    speed: {
        type: Number
    },
    strength: {
        type: Number
    },
    strengthAtt: {
        type: Number
    },
    strengthSave: {
        type: Number
    },
    temporaryHitPoints: {
        type: Number
    },
    totalHitDice: {
        type: Number
    },
    wisdom: {
        type: Number
    },
    wisdomAtt: {
        type: Number
    },
    wisdomSave: {
        type: Number
    }
})

module.exports = mongoose.model('CharSchema', characterSchema)