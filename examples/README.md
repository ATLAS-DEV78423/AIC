# WFL Examples

A gallery of Web Formation Language expressions and their compiled React/JSX output.

---

## Button Variants

**WFL:**
```wfl
btn::pri:"Get Started"
btn::sec:"Learn More"
btn::gh:"Cancel"
btn::out:"Download"
```

**Generated JSX:**
```tsx
<main>
  <button type="button" className="bg-blue-600 text-white hover:bg-blue-700 ...">
    Get Started
  </button>
  <button type="button" className="bg-gray-100 text-gray-900 hover:bg-gray-200 ...">
    Learn More
  </button>
  <button type="button" className="bg-transparent hover:bg-gray-100 text-gray-700 ...">
    Cancel
  </button>
  <button type="button" className="border border-gray-300 bg-white hover:bg-gray-50 ...">
    Download
  </button>
</main>
```

---

## Navigation Bar

**WFL:**
```wfl
nav::gls::fix > lnk:"Home" ^ lnk::pri:"Features" ^ lnk:"Pricing" ^ btn::pri:"Sign Up"
```

**Generated JSX:**
```tsx
<nav className="backdrop-blur-md bg-white/10 border-b fixed top-0 left-0 right-0 z-50 px-4 py-3">
  <a>Home</a>
  <a className="text-blue-600 hover:text-blue-800 underline underline-offset-4">Features</a>
  <a>Pricing</a>
  <button type="button" className="bg-blue-600 text-white ...">Sign Up</button>
</nav>
```

---

## Form with State & Events

**WFL:**
```wfl
@query
frm > stk::v > lbl:"Search" ^ inp::txt:"Type here" @query !onChange::setQuery ^ btn::pri:"Submit"
```

**Generated JSX:**
```tsx
"use client";
import { useState } from "react";

export default function form() {
  const [query, setQuery] = useState('')

  return (
    <main>
      <form method="POST">
        <div className="flex flex-col">
          <label>Search</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          >
            Type here
          </input>
          <button type="button" className="bg-blue-600 text-white ...">
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}
```

Key features demonstrated:
- Auto `useState` import and declaration
- `value={query}` auto-binding from `@query`
- `onChange={(e) => setQuery(e.target.value)}` smart event wrapping

---

## Card Grid with Iteration

**WFL:**
```wfl
sec::feat > txt::h1:"Features" ^ grd::3 > *3 > card::out > txt::p:"Card content"
```

**Generated JSX:**
```tsx
<section>
  <p className="text-3xl font-bold tracking-tight sm:text-4xl">Features</p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <p className="text-base leading-7">Card content</p>
    </div>
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <p className="text-base leading-7">Card content</p>
    </div>
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <p className="text-base leading-7">Card content</p>
    </div>
  </div>
</section>
```

---

## Conditional Rendering

**WFL:**
```wfl
?@user | txt::h1:"Welcome back!" | btn::pri:"Sign In"
```

**Generated JSX:**
```tsx
{user ? (
  <p className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back!</p>
) : (
  <button type="button" className="bg-blue-600 text-white ...">Sign In</button>
)}
```

---

## Animated Hero Section

**WFL:**
```wfl
hero::cen > stk::v::ctr > txt::h1 ~slide:"Build Something Great" ^ txt::p ~fade:"Start your journey today" ^ btn::pri ~bounce:"Get Started"
```

**Generated JSX:**
```tsx
<>
  <section className="w-full py-20 md:py-32 flex flex-col items-center text-center px-4">
    <div className="flex flex-col items-center justify-center">
      <p className="text-3xl font-bold tracking-tight sm:text-4xl anim-slide">
        Build Something Great
      </p>
      <p className="text-base leading-7 anim-fade">
        Start your journey today
      </p>
      <button type="button" className="bg-blue-600 text-white ... anim-bounce">
        Get Started
      </button>
    </div>
  </section>
  <style>
    @keyframes anim-slide { ... }
    @keyframes anim-fade { ... }
    @keyframes anim-bounce { ... }
  </style>
</>
```
Animations generate both CSS `@keyframes` and applied CSS classes automatically.

---

## Try them yourself

```bash
# Install WFL globally (one-time)
npm install -g wfl

# Compile any example to stdout
wfl compile examples/button.wfl

# Compile and write to a file
wfl compile examples/navbar.wfl --out navbar.tsx

# Build all examples at once
wfl build examples/ --out dist/

# Or run directly without installing
npx wfl compile examples/button.wfl
```
