# 👩‍🏫 Teaching Engine 2.0 - Testing Guide for Grade 1 French Immersion Teachers

## 🚀 **HOW TO START TESTING**

### **Step 1: Start the App**
```bash
# In Terminal, navigate to the project folder and run:
cd /Users/michaelmcisaac/Github/teaching-engine2.0
npm run dev
```

Wait for these messages:
- ✅ Client ready at: `http://localhost:5173`
- ✅ Server ready at: `http://localhost:3000`

### **Step 2: Open Your Browser**
Go to: **http://localhost:5173**

---

## 🎯 **COMPLETE TEACHER TESTING WORKFLOW**

### **Phase 1: First-Time Teacher Experience (5-10 minutes)**

1. **Open the app** - You'll see the Teaching Engine 2.0 landing page
2. **Onboarding starts automatically** - A welcome wizard will appear
3. **Go through 4 onboarding steps:**
   - Welcome & Introduction to ETFO planning
   - Understanding the 5-level planning workflow
   - **CRITICAL: Subject Selection** - Choose which subjects you teach:
     - ✅ **Core subjects:** Français langue première, Mathématiques
     - ✅ **Optional:** Sciences, Études sociales, English Language Arts, Arts
     - ⚠️ **Specialist:** Éducation physique, Éducation à la santé (only if you teach these)
   - Feature overview and AI assistance tour

**What to test:** Does the onboarding feel helpful? Is subject selection clear?

---

### **Phase 2: Curriculum Discovery (10-15 minutes)**

4. **Dashboard Overview** - After onboarding, you'll see:
   - Welcome message with your name
   - Your selected teaching subjects displayed
   - Curriculum coverage progress bars (will be 0% initially)
   - Quick action buttons

5. **Explore Curriculum Expectations:**
   - Click "📋 Curriculum Expectations" card
   - **You should see:** Alert showing your selected subjects
   - **Browse Grade 1 expectations** for your subjects only
   - **Test search:** Try searching for "communication" or "addition"
   - **Filter by subject:** Use dropdown to focus on specific subjects

**What to test:** 
- ✅ Do you see only YOUR selected subjects?
- ✅ Are the expectations relevant to Grade 1 French Immersion in PEI?
- ✅ Can you easily find specific expectations?

---

### **Phase 3: Long-Range Planning (15-20 minutes)**

6. **Create Long-Range Plans:**
   - Click "📚 Long Range Plans" from dashboard
   - **Create a new plan** for the school year
   - **Add themes/units** like:
     - "Tout sur moi" (September)
     - "Les saisons" (October-November)
     - "Ma famille" (December)
     - "Les animaux" (January-February)

**What to test:** Does this feel like realistic year planning for Grade 1?

---

### **Phase 4: Unit Planning (20-30 minutes)**

7. **Design Unit Plans:**
   - Click "📚 View Unit Plans" from dashboard
   - **Create a detailed unit** (e.g., "Tout sur moi")
   - **Add curriculum expectations** from your subjects
   - **Include:**
     - Big ideas and essential questions
     - Key vocabulary in French
     - Assessment strategies
     - Activities and resources

**What to test:** Can you create a complete unit that covers multiple subjects?

---

### **Phase 5: Daily Lesson Planning (15-20 minutes)**

8. **Plan Individual Lessons:**
   - Click "✨ Create Today's Lesson" from dashboard
   - **Use the 3-part ETFO structure:**
     - **Minds On:** Opening activity (5-10 mins)
     - **Action:** Main learning activities (20-30 mins)  
     - **Consolidation:** Wrap-up and reflection (5-10 mins)
   - **Link to curriculum expectations**
   - **Add materials and differentiation**

**What to test:** Does this create a complete, teachable lesson plan?

---

### **Phase 6: Daily Tracking & Reflection (10 minutes)**

9. **Use the Daybook:**
   - Click "📖 Daily Reflections" from dashboard
   - **Record observations** about:
     - What worked well?
     - What needs improvement?
     - Student progress notes
     - Ideas for tomorrow

**What to test:** Is this useful for professional reflection and growth?

---

### **Phase 7: Communication with Parents (10 minutes)**

10. **Create Newsletters:**
    - Click "📄 Newsletter" (if available in navigation)
    - **Generate parent communications** about:
      - What students are learning
      - Upcoming events
      - Ways parents can help at home
      - Celebration of student achievements

**What to test:** Would this save time communicating with parents?

---

## 🔍 **CRITICAL TESTING CHECKLIST**

### **✅ Subject Selection Testing:**
- [ ] Can you easily select/deselect subjects during onboarding?
- [ ] Does the app only show curriculum for YOUR subjects?
- [ ] Can you update subject selection later from the dashboard?
- [ ] Does it warn you if you don't select core subjects (Français & Math)?

### **✅ Curriculum Coverage Testing:**
- [ ] Do coverage indicators on dashboard show realistic progress?
- [ ] As you create lessons, does coverage percentage increase?
- [ ] Are all 68 Grade 1 expectations visible for selected subjects?

### **✅ Real Teacher Workflow Testing:**
- [ ] Can you go from "not knowing curriculum" to "having lessons planned"?
- [ ] Does the planning feel natural for Grade 1 French Immersion?
- [ ] Are the PEI-specific elements (Acadian culture, etc.) present?
- [ ] Would this actually save you time in planning?

### **✅ Edge Case Testing:**
- [ ] What happens if you close the browser and come back?
- [ ] Can you change your mind about subject selection?
- [ ] Does it work on mobile/tablet?
- [ ] What happens if internet is slow?

---

## 🎯 **KEY QUESTIONS FOR YOUR WIFE:**

1. **First Impression:** "Does this look like something I'd actually use?"
2. **Curriculum Relevance:** "Are these the right expectations for Grade 1 French Immersion in PEI?"
3. **Planning Efficiency:** "Would this save me time compared to my current planning process?"
4. **User Experience:** "Is it intuitive? Do I get stuck anywhere?"
5. **Missing Features:** "What's missing that I need for my teaching?"
6. **Real-World Test:** "Could I use this to plan next week's lessons right now?"

---

## 🚨 **IF SOMETHING DOESN'T WORK:**

1. **Refresh the page** (F5 or Cmd+R)
2. **Check the terminal** for any error messages
3. **Try in a different browser** (Chrome, Firefox, Safari)
4. **Clear browser data:** Settings > Privacy > Clear browsing data
5. **Restart the dev server:** Ctrl+C in terminal, then `npm run dev` again

---

## 💡 **REALISTIC TESTING SCENARIO:**

**"I'm a new Grade 1 French Immersion teacher at École Évangéline in Summerside. It's August, and I need to plan my entire year and be ready for the first week of school. Can this app actually help me do that?"**

Try using the app to plan:
- September theme: "Bienvenue à l'école" 
- First week lessons covering Français, Math, and Sciences
- Parent newsletter introducing yourself and the curriculum

**Total realistic test time: 2-3 hours** (same as a good planning session)

---

## 🎉 **SUCCESS CRITERIA:**

If your wife can complete this workflow and says:
- ✅ "I could actually use this for my real teaching"
- ✅ "This would save me planning time" 
- ✅ "The curriculum expectations are accurate for PEI"
- ✅ "I understand how to use all the features"

**Then the app is truly perfect!** 🚀

---

*Happy testing! 👩‍🏫✨*