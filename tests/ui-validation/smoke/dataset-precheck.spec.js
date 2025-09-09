const { UI_BASE_URL, API_BASE_URL, newPage, waitForHealthy, expect } = global.__UI__;

describe('[SMOKE] Dataset precheck (Emily)', () => {
  let page;
  
  beforeAll(async () => { 
    await waitForHealthy(); 
  });
  
  beforeEach(async () => { 
    page = await newPage(browser); 
  });
  
  afterEach(async () => { 
    await page.close(); 
  });

  it('API returns at least one lesson for Emily (userId=23)', async () => {
    // Use page.evaluate to make the API call within the browser context
    const result = await page.evaluate(async (api) => {
      try {
        const response = await fetch(`${api}/api/etfo-lesson-plans?userId=23&limit=1`, { 
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        const data = await response.json().catch(() => null);
        
        return { 
          ok: response.ok, 
          status: response.status, 
          json: data 
        };
      } catch (error) {
        return { 
          ok: false, 
          status: 0, 
          error: error.message 
        };
      }
    }, API_BASE_URL);
    
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(Array.isArray(result.json) || (result.json && Array.isArray(result.json.data))).toBe(true);
    
    const lessons = Array.isArray(result.json) ? result.json : result.json.data;
    expect(lessons.length).toBeGreaterThan(0);
    
    console.log('✓ Emily\'s dataset confirmed: At least one lesson exists');
  });

  it('API confirms Emily has substantial lesson count', async () => {
    // Check if Emily has the expected ~970 lessons
    const result = await page.evaluate(async (api) => {
      try {
        const response = await fetch(`${api}/api/etfo-lesson-plans?userId=23&limit=1000`, { 
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        const data = await response.json();
        
        return { 
          ok: response.ok,
          count: Array.isArray(data) ? data.length : (data.data ? data.data.length : 0),
          totalCount: data.totalCount || null
        };
      } catch (error) {
        return { 
          ok: false, 
          error: error.message 
        };
      }
    }, API_BASE_URL);
    
    expect(result.ok).toBe(true);
    
    // Check for substantial lesson count (should be ~970 but we'll check for >= 900)
    const lessonCount = result.totalCount || result.count;
    expect(lessonCount).toBeGreaterThanOrEqual(900);
    
    console.log(`✓ Emily has ${lessonCount} lessons in the system`);
  });
});