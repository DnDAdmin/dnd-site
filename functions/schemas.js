const mongoose = require('mongoose')
const {ObjectId} = require('mongodb');

const characterSchema = new mongoose.Schema({
    _id: {
        type: ObjectId,
        required: true
    },
    alignment: {
        type: String,
        default: ""
    },
    armourClass: {
        type: Number,
        default: 0
    },
    artWork: {
        type: String,
        default: null
    },
    artWorkKey: {
        type: String,
        default: null
    },
    attacks: {
        type: String,
        default: ""
    },
    background: {
        type: String,
        default: ""
    },
    bonds: {
        type: String,
        default: ""
    },
    charisma: {
        type: Number,
        default: 10
    },
    charismaAtt: {
        type: Number,
        default: 0
    },
    charismaSave: {
        type: Number,
        default: 0
    },
    clas: {
        type: String,
        default: ""
    },
    subClass: {
        type: String,
        default: ""
    },
    constitution: {
        type: Number,
        default: 10
    },
    constitutionAtt: {
        type: Number,
        default: 0
    },
    constitutionSave: {
        type: Number,
        default: 0
    },
    cp: {
        type: Number,
        default: 0
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
        type: Number,
        default: 10
    },
    dexterityAtt: {
        type: Number,
        default: 0
    },
    dexteritySave: {
        type: Number,
        default: 0
    },
    ep: {
        type: Number,
        default: 0
    },
    equipment: {
        type: String,
        default: ""
    },
    experiencePoints: {
        type: Number,
        default: 0
    },
    faction: {
        type: String,
        default: ""
    },
    featuresTraits: {
        type: String,
        default: ""
    },
    flaws: {
        type: String,
        default: ""
    },
    gp: {
        type: Number,
        default: 0
    },
    hitPoints: {
        type: Number,
        default: 0
    },
    history: {
        type: String,
        default: ""
    },
    hitDice: {
        type: Number,
        default: 0
    },
    ideals: {
        type: String,
        default: ""
    },
    initiative: {
        type: Number,
        default: 0
    },
    inspiration: {
        type: Number,
        default: 0
    },
    intelligence: {
        type: Number,
        default: 10
    },
    intelligenceAtt: {
        type: Number,
        default: 0
    },
    intelligenceSave: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    maxHitPoints: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        default: ""
    },
    notes: {
        type: String,
        default: ""
    },
    otherProficiencies: {
        type: String,
        default: ""
    },
    owner: {
        type: ObjectId,
        default: ""
    },
    passivePerception: {
        type: Number,
        default: 0
    },
    personaility: {
        type: String,
        default: ""
    },
    pp: {
        type: Number,
        default: 0
    },
    proficiencyBonus: {
        type: Number,
        default: 0
    },
    race: {
        type: String,
        default: ""
    },
    skillAcrobatics: {
        type: Number,
        default: 0
    },
    skillAnimalHandling: {
        type: Number,
        default: 0
    },
    skillArcana: {
        type: Number,
        default: 0
    },
    skillAthletics: {
        type: Number,
        default: 0
    },
    skillDeception: {
        type: Number,
        default: 0
    },
    skillHistory: {
        type: Number,
        default: 0
    },
    skillInsight: {
        type: Number,
        default: 0
    },
    skillIntimidation: {
        type: Number,
        default: 0
    },
    skillInvestigation: {
        type: Number,
        default: 0
    },
    skillMedicine: {
        type: Number,
        default: 0
    },
    skillNature: {
        type: Number,
        default: 0
    },
    skillPerception: {
        type: Number,
        default: 0
    },
    skillPerformance: {
        type: Number,
        default: 0
    },
    skillPersuasion: {
        type: Number,
        default: 0
    },
    skillReligion: {
        type: Number,
        default: 0
    },
    skillSleightOfHand: {
        type: Number,
        default: 0
    },
    skillStealth: {
        type: Number,
        default: 0
    },
    skillSurvival: {
        type: Number,
        default: 0
    },
    sp: {
        type: Number,
        default: 0
    },
    speed: {
        type: Number,
        default: 0
    },
    strength: {
        type: Number,
        default: 10
    },
    strengthAtt: {
        type: Number,
        default: 0
    },
    strengthSave: {
        type: Number,
        default: 0
    },
    temporaryHitPoints: {
        type: Number,
        default: 0
    },
    totalHitDice: {
        type: Number,
        default: 0
    },
    wisdom: {
        type: Number,
        default: 10
    },
    wisdomAtt: {
        type: Number,
        default: 0
    },
    wisdomSave: {
        type: Number,
        default: 0
    }
})
let CharSchema = mongoose.model('CharSchema', characterSchema)


module.exports = {CharSchema}