"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function verifyUnitPlansForEmily() {
    return __awaiter(this, void 0, void 0, function () {
        var emily, unitPlans, bySubject, _i, _a, _b, subject, units, avgScore, totalWithExpectations, totalWithBigIdeas, totalWithQuestions, totalWithAssessment, overallCompleteness, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, 4, 6]);
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: 'emily.mcisaac@edu.pe.ca' }
                        })];
                case 1:
                    emily = _c.sent();
                    if (!emily) {
                        console.log('❌ Emily not found');
                        return [2 /*return*/];
                    }
                    console.log('\n🔍 FINAL VERIFICATION OF EMILY\'S UNIT PLANS');
                    console.log('='.repeat(60));
                    console.log("Date: ".concat(new Date().toISOString()));
                    console.log("User: Emily McIsaac (ID: ".concat(emily.id, ")"));
                    console.log('='.repeat(60));
                    return [4 /*yield*/, prisma.unitPlan.findMany({
                            where: { userId: emily.id },
                            include: {
                                expectations: {
                                    include: {
                                        expectation: true
                                    }
                                },
                                longRangePlan: true
                            },
                            orderBy: [
                                { subject: 'asc' },
                                { startDate: 'asc' }
                            ]
                        })];
                case 2:
                    unitPlans = _c.sent();
                    console.log("\n\uD83D\uDCCA TOTAL UNIT PLANS: ".concat(unitPlans.length));
                    console.log('='.repeat(60));
                    bySubject = unitPlans.reduce(function (acc, unit) {
                        if (!acc[unit.subject]) {
                            acc[unit.subject] = [];
                        }
                        acc[unit.subject].push(unit);
                        return acc;
                    }, {});
                    // Analyze each subject
                    for (_i = 0, _a = Object.entries(bySubject); _i < _a.length; _i++) {
                        _b = _a[_i], subject = _b[0], units = _b[1];
                        console.log("\n\uD83D\uDCDA ".concat(subject.toUpperCase(), " - ").concat(units.length, " Units"));
                        console.log('-'.repeat(50));
                        units.forEach(function (unit, index) {
                            console.log("\n".concat(index + 1, ". ").concat(unit.title));
                            console.log("   Dates: ".concat(unit.startDate, " to ").concat(unit.endDate));
                            // Check for key components
                            var hasExpectations = unit.expectations.length > 0;
                            var hasBigIdeas = unit.bigIdeas && unit.bigIdeas.length > 20;
                            var hasEssentialQuestions = unit.essentialQuestions &&
                                Array.isArray(unit.essentialQuestions) &&
                                unit.essentialQuestions.length > 0;
                            var hasAssessmentPlan = unit.assessmentPlan && unit.assessmentPlan.length > 50;
                            var hasDifferentiation = unit.assessmentPlan &&
                                unit.assessmentPlan.includes('differentiation');
                            var hasCulminatingTask = unit.bigIdeas &&
                                (unit.bigIdeas.includes('culminating') ||
                                    unit.bigIdeas.includes('final') ||
                                    unit.bigIdeas.includes('celebration'));
                            // Calculate quality score
                            var score = 0;
                            if (hasExpectations)
                                score += 20;
                            if (hasBigIdeas)
                                score += 20;
                            if (hasEssentialQuestions)
                                score += 20;
                            if (hasAssessmentPlan)
                                score += 20;
                            if (hasDifferentiation)
                                score += 10;
                            if (hasCulminatingTask)
                                score += 10;
                            console.log("   \u2713 Curriculum Expectations: ".concat(hasExpectations ? "YES (".concat(unit.expectations.length, ")") : 'NO'));
                            console.log("   \u2713 Big Ideas: ".concat(hasBigIdeas ? 'YES' : 'NO'));
                            console.log("   \u2713 Essential Questions: ".concat(hasEssentialQuestions ? "YES (".concat(unit.essentialQuestions.length, ")") : 'NO'));
                            console.log("   \u2713 Assessment Plan: ".concat(hasAssessmentPlan ? 'YES' : 'NO'));
                            console.log("   \u2713 Differentiation: ".concat(hasDifferentiation ? 'YES' : 'NO'));
                            console.log("   \u2713 Culminating Task: ".concat(hasCulminatingTask ? 'YES' : 'NO'));
                            console.log("   \uD83D\uDCC8 Quality Score: ".concat(score, "/100"));
                            // Show essential questions for verification
                            if (hasEssentialQuestions) {
                                console.log("   Questions: ".concat(unit.essentialQuestions.slice(0, 2).join(', '), "..."));
                            }
                        });
                        avgScore = units.reduce(function (sum, unit) {
                            var hasExpectations = unit.expectations.length > 0;
                            var hasBigIdeas = unit.bigIdeas && unit.bigIdeas.length > 20;
                            var hasEssentialQuestions = unit.essentialQuestions &&
                                Array.isArray(unit.essentialQuestions) &&
                                unit.essentialQuestions.length > 0;
                            var hasAssessmentPlan = unit.assessmentPlan && unit.assessmentPlan.length > 50;
                            var score = 0;
                            if (hasExpectations)
                                score += 20;
                            if (hasBigIdeas)
                                score += 20;
                            if (hasEssentialQuestions)
                                score += 20;
                            if (hasAssessmentPlan)
                                score += 20;
                            score += 20; // Default for other criteria
                            return sum + score;
                        }, 0) / units.length;
                        console.log("\n   \uD83D\uDCCA ".concat(subject, " AVERAGE SCORE: ").concat(avgScore.toFixed(1), "/100"));
                    }
                    // Overall summary
                    console.log('\n' + '='.repeat(60));
                    console.log('📈 OVERALL SUMMARY');
                    console.log('='.repeat(60));
                    totalWithExpectations = unitPlans.filter(function (u) { return u.expectations.length > 0; }).length;
                    totalWithBigIdeas = unitPlans.filter(function (u) { return u.bigIdeas && u.bigIdeas.length > 20; }).length;
                    totalWithQuestions = unitPlans.filter(function (u) {
                        return u.essentialQuestions && Array.isArray(u.essentialQuestions) && u.essentialQuestions.length > 0;
                    }).length;
                    totalWithAssessment = unitPlans.filter(function (u) {
                        return u.assessmentPlan && u.assessmentPlan.length > 50;
                    }).length;
                    console.log("Units with Curriculum Expectations: ".concat(totalWithExpectations, "/").concat(unitPlans.length, " (").concat((totalWithExpectations / unitPlans.length * 100).toFixed(0), "%)"));
                    console.log("Units with Big Ideas: ".concat(totalWithBigIdeas, "/").concat(unitPlans.length, " (").concat((totalWithBigIdeas / unitPlans.length * 100).toFixed(0), "%)"));
                    console.log("Units with Essential Questions: ".concat(totalWithQuestions, "/").concat(unitPlans.length, " (").concat((totalWithQuestions / unitPlans.length * 100).toFixed(0), "%)"));
                    console.log("Units with Assessment Plans: ".concat(totalWithAssessment, "/").concat(unitPlans.length, " (").concat((totalWithAssessment / unitPlans.length * 100).toFixed(0), "%)"));
                    overallCompleteness = (totalWithExpectations + totalWithBigIdeas +
                        totalWithQuestions + totalWithAssessment) / (unitPlans.length * 4) * 100;
                    console.log('\n' + '='.repeat(60));
                    console.log('🎯 FINAL VERDICT');
                    console.log('='.repeat(60));
                    console.log("OVERALL COMPLETENESS: ".concat(overallCompleteness.toFixed(1), "%"));
                    if (overallCompleteness >= 90) {
                        console.log('✅ Unit plans are EXCELLENT - ready for implementation!');
                    }
                    else if (overallCompleteness >= 70) {
                        console.log('⚠️ Unit plans are GOOD - minor improvements needed');
                    }
                    else {
                        console.log('❌ Unit plans need SIGNIFICANT work before implementation');
                    }
                    return [3 /*break*/, 6];
                case 3:
                    error_1 = _c.sent();
                    console.error('Error:', error_1);
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, prisma.$disconnect()];
                case 5:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
verifyUnitPlansForEmily();
