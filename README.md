# Photo Frame Maker

একটি সম্পূর্ণ client-side Photo Frame Maker—কোনো backend বা API key দরকার নেই।

## ফিচার
- ছবি নির্বাচন (JPG/PNG/WebP)
- চারটি built-in frame style
- জুম ও ছবির অবস্থান ঠিক করা
- Portrait, Square ও Story export size
- High-resolution PNG download
- Responsive mobile/desktop layout
- ছবি সার্ভারে আপলোড হয় না; ব্রাউজারেই কাজ হয়

## GitHub Pages-এ প্রকাশ
1. GitHub-এ নতুন public repository তৈরি করুন, যেমন `photo-frame-maker`.
2. ZIP extract করে `index.html`, `style.css`, `script.js`, `README.md` ফাইলগুলো repository-র root-এ upload করুন।
3. Repository-র **Settings → Pages** খুলুন।
4. **Build and deployment** অংশে **Deploy from a branch** নির্বাচন করুন।
5. Branch হিসেবে `main` এবং folder হিসেবে `/(root)` নির্বাচন করে Save দিন।
6. কয়েক মিনিট পরে GitHub Pages-এ দেখানো URL খুলুন।

## নিজের ফ্রেম যোগ করা
বর্তমান ফ্রেমগুলো কোড দিয়ে আঁকা হয়। আসল transparent PNG overlay ব্যবহার করতে চাইলে একটি অনুমোদিত transparent PNG ফ্রেম `frames/` ফোল্ডারে যোগ করে `script.js`-এ image overlay rendering যুক্ত করা যায়।

## নোট
এই starter project reference-এর মতো মূল workflow দেয়, কিন্তু reference site-এর নির্দিষ্ট artwork বা branding কপি করে না। নিজের বা ব্যবহারের অনুমতি থাকা ফ্রেম ব্যবহার করুন.
