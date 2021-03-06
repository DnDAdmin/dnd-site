class DndCharacter {
    constructor(_id, alignment, armourClass, artWork, artWorkKey, attacks, background, bonds, charisma, charismaAtt, charismaSave, clas, subClass, constitution, constitutionAtt, constitutionSave, cp, deathsaveFailures, deathSaveSuccesses, dexterity, dexterityAtt, dexteritySave, ep, equipment, experiencePoints, faction, featuresTraits, flaws, gp, hitPoints, history, hitDice, ideals, initiative, inspiration, intelligence, intelligenceAtt, intelligenceSave, level, maxHitPoints, name, notes, otherProficiencies, owner, passivePerception, personaility, pp, proficiencyBonus, race, skillAcrobatics, skillAnimalHandling, skillArcana, skillAthletics, skillDeception, skillHistory, skillInsight, skillIntimidation, skillInvestigation, skillMedicine, skillNature, skillPerception, skillPerformance, skillPersuasion, skillReligion, skillSleightOfHand, skillStealth, skillSurvival, sp, speed, strength, strengthAtt, strengthSave, temporaryHitPoints, totalHitDice, wisdom, wisdomAtt, wisdomSave) {
        this._id = _id;
        this.alignment = alignment || '';
        this.armourClass = parseInt(armourClass);
        this.artWork = artWork;
        this.artWorkKey = artWorkKey;
        this.attacks = attacks;
        this.background = background;
        this.bonds = bonds;
        this.charisma = charisma;
        this.charismaAtt = charismaAtt;
        this.charismaSave = charismaSave;
        this.clas = clas;
        this.subClass = subClass;
        this.constitution = constitution;
        this.constitutionAtt = constitutionAtt;
        this.constitutionSave = constitutionSave;
        this.cp = cp;
        this.deathsaveFailures = deathsaveFailures;
        this.deathSaveSuccesses = deathSaveSuccesses;
        this.dexterity = dexterity;
        this.dexterityAtt = dexterityAtt;
        this.dexteritySave = dexteritySave;
        this.ep = ep;
        this.equipment = equipment;
        this.experiencePoints = experiencePoints;
        this.faction = faction;
        this.featuresTraits = featuresTraits;
        this.flaws = flaws;
        this.gp = gp;
        this.hitPoints = hitPoints;
        this.history = history;
        this.hitDice = hitDice;
        this.ideals = ideals;
        this.initiative = initiative;
        this.inspiration = inspiration;
        this.intelligence = intelligence;
        this.intelligenceAtt = intelligenceAtt;
        this.intelligenceSave = intelligenceSave;
        this.level = level;
        this.maxHitPoints = maxHitPoints;
        this.name = name;
        this.notes = notes;
        this.otherProficiencies = otherProficiencies;
        this.owner = owner;
        this.passivePerception = passivePerception;
        this.personaility = personaility;
        this.pp = pp;
        this.proficiencyBonus = proficiencyBonus;
        this.race = race;
        this.skillAcrobatics = skillAcrobatics;
        this.skillAnimalHandling = skillAnimalHandling;
        this.skillArcana = skillArcana;
        this.skillAthletics = skillAthletics;
        this.skillDeception = skillDeception;
        this.skillHistory = skillHistory;
        this.skillInsight = skillInsight;
        this.skillIntimidation = skillIntimidation;
        this.skillInvestigation = skillInvestigation;
        this.skillMedicine = skillMedicine;
        this.skillNature = skillNature;
        this.skillPerception = skillPerception;
        this.skillPerformance = skillPerformance;
        this.skillPersuasion = skillPersuasion;
        this.skillReligion = skillReligion;
        this.skillSleightOfHand = skillSleightOfHand;
        this.skillStealth = skillStealth;
        this.skillSurvival = skillSurvival;
        this.sp = sp;
        this.speed = speed;
        this.strength = strength;
        this.strengthAtt = strengthAtt;
        this.strengthSave = strengthSave;
        this.temporaryHitPoints = temporaryHitPoints;
        this.totalHitDice = totalHitDice;
        this.wisdom = wisdom;
        this.wisdomAtt = wisdomAtt;
        this.wisdomSave = wisdomSave;
    }
    takeDamage(amount) {
        this.hitPoints -= amount
        return this
    }
}

class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
}

module.exports = {DndCharacter}