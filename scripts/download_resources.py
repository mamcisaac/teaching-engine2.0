#!/usr/bin/env python3
import os, re, time, argparse, requests
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# ─── Helpers ──────────────────────────────────────────────────────────────────

def slugify(url):
    p = urlparse(url).path.strip('/')
    return re.sub(r'[^A-Za-z0-9]+', '_', p) or 'root'

def get_confirm_token(resp):
    for k,v in resp.cookies.items():
        if k.startswith('download_warning'):
            return v
    return None

def infer_extension(content_type):
    if content_type.startswith('application/pdf'):
        return '.pdf'
    if 'wordprocessingml.document' in content_type or 'msword' in content_type:
        return '.docx'
    if 'presentationml.presentation' in content_type:
        return '.pptx'
    if 'spreadsheet' in content_type:
        return '.xlsx'
    return ''

def extract_filename(resp, fallback_base):
    """
    Try to parse filename from Content-Disposition. If missing, use fallback_base + inferred ext.
    """
    cd = resp.headers.get('Content-Disposition','')
    # look for filename="something.ext"
    m = re.search(r'filename\*?=(?:UTF-8\'\')?"?([^\";]+)"?', cd)
    if m:
        return m.group(1)
    # fallback
    ext = infer_extension(resp.headers.get('Content-Type',''))
    return fallback_base + ext

# ─── Download routines ────────────────────────────────────────────────────────

def download_drive_file(session, fid, outdir):
    base   = "https://drive.google.com/uc?export=download"
    params = {'id': fid}
    r = session.get(base, params=params, stream=True)
    token = get_confirm_token(r)
    if token:
        r = session.get(base, params={'id': fid, 'confirm': token}, stream=True)
    r.raise_for_status()

    # figure out real filename
    filename = extract_filename(r, fid)
    path = os.path.join(outdir, filename)
    os.makedirs(outdir, exist_ok=True)

    with open(path, 'wb') as f:
        for chunk in r.iter_content(32768):
            f.write(chunk)
    print(f" ✅ Saved Drive file {filename}")

def download_doc_export(session, did, outdir, fmt):
    url    = f"https://docs.google.com/document/d/{did}/export"
    params = {'format': fmt}
    r = session.get(url, params=params, stream=True)
    token = get_confirm_token(r)
    if token:
        r = session.get(url, params={**params, 'confirm': token}, stream=True)
    r.raise_for_status()

    # name it DID_export.ext
    ext = '.pdf' if fmt=='pdf' else '.docx'
    filename = f"{did}_export{ext}"
    path = os.path.join(outdir, filename)
    os.makedirs(outdir, exist_ok=True)

    with open(path, 'wb') as f:
        for chunk in r.iter_content(32768):
            f.write(chunk)
    print(f" ✅ Saved Doc export {filename}")

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(description="Download resources from Google Sites → ../resources/")
    p.add_argument('urls', nargs='+', help="One or more Google Sites URLs to scrape")
    args = p.parse_args()

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'resources'))
    os.makedirs(base_dir, exist_ok=True)

    # 1) Launch Chrome & log in
    opts = Options()
    opts.add_argument("--start-maximized")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)
    driver.get("https://accounts.google.com/signin")
    input("👉 Log in to Google in the browser, then press ENTER here…")

    # 2) Collect file & doc IDs per URL
    id_map = {}
    for url in args.urls:
        slug   = slugify(url)
        outdir = os.path.join(base_dir, slug)
        print(f"\n🌐 Processing {url}\n→ will save into {outdir}")

        driver.get(url)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)
        src = driver.page_source

        files   = set(re.findall(r'/file/d/([A-Za-z0-9_-]+)', src))
        files  |= set(re.findall(r'open\?id=([A-Za-z0-9_-]+)', src))
        docs    = set(re.findall(r'/document/d/([A-Za-z0-9_-]+)', src))
        folders = set(re.findall(r'https://drive\.google\.com/drive/folders/[A-Za-z0-9_-]+', src))

        for fldr in folders:
            print("   🔍 crawling folder:", fldr)
            driver.get(fldr)
            time.sleep(3)
            sub = driver.page_source
            files |= set(re.findall(r'/file/d/([A-Za-z0-9_-]+)', sub))
            files |= set(re.findall(r'open\?id=([A-Za-z0-9_-]+)', sub))
            docs  |= set(re.findall(r'/document/d/([A-Za-z0-9_-]+)', sub))

        id_map[url] = (outdir, files, docs)

    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    driver.quit()

    # 3) Prepare requests session
    sess = requests.Session()
    for k,v in cookies.items():
        sess.cookies.set(k, v)

    # 4) Download!
    for url, (outdir, files, docs) in id_map.items():
        print(f"\n📥 Downloading for {url}")

        for fid in files:
            try:
                download_drive_file(sess, fid, outdir)
            except Exception as e:
                print(f" ❌ Failed Drive file {fid}: {e}")

        for did in docs:
            for fmt in ('pdf','docx'):
                try:
                    download_doc_export(sess, did, outdir, fmt)
                except Exception as e:
                    print(f" ❌ Failed Doc {did} as {fmt}: {e}")

    print(f"\n🎉 All done! Check your files in {base_dir}")

if __name__ == '__main__':
    main()
