---
title: Failing Forms and the Form Prop
date: '2023-07-06'
description: description
tags:
  - levelup
  - sveltekit
  - forms
  - actions
---
## [Forms and Form Actions video](https://levelup.video/tutorials/sveltekit/forms-and-form-actions)

Svelte allows you to progressively enhanced forms. This means they can use JS when it helps, and rely on HTML actions when it isn't. For example, adding ```required``` flag to input elements: why use JS when HTML will do it just as well?

[Form data has its own API (with docs)](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

## Create a contact form!

1. Create route and files:
	- ```code src/routes/contact/+page.svelte```
	- ```code src/routes/contact/+page.server.js```
2. Create contact link in global footer (```src/routes/Footer.svelte```):

```html
<footer>
	<a href="/contact"> Contact</a>
	<p>Made with svelte</p>
</footer>

```

3. In contact page, create a basic form with no actions:

```html
<form action="">
	<label>
		Name:
		<input type="text" name="name" id="name" required />
	</label>
	<label>
		Email:
		<input type="email" name="email" id="email" required />
		<label>
			Message:
			<textarea name="message" id="message" required />
		</label>
	</label>
    <button type="submit">Send</button>
</form>

```

4. Update the form element: ```<form method="POST">```
	This [form action](https://kit.svelte.dev/docs/form-actions) sends the form data directly to the ```+page.server.svelte``` file, where you can validate data with JS without needing to use client side JS.

5. ```+page.server.js``` expects the incoming data in a certain format. Here we are sending an action from the contact form page to the contact form server, so we can use ```default```. Here, simply print the request:

```javascript
export const actions = {
    default: ( { locals, request }) => {
        console.log('contact page server action', request);
    }
}
```

6. To access form data, make async, access ```formData()``` and get name, email, message:

```javascript
export const actions = {
    default: async ( { locals, request }) => {
        const data = await request.formData();

        const name = data.get('name');
        const email = data.get('email');
        const message = data.get('message');
        console.log('contact page server action', name, email, message);

        return {
            message: ```Email sent!```
        }
    }
}
```

--> page refreshes and console logs ```contact page server action Christopher Cozens officechrisgarden@gmail.com win```

#[Progressive enhancement](https://levelup.video/tutorials/sveltekit/progressive-enhancement-in-forms)

[Progressive enhancement](https://kit.svelte.dev/docs/form-actions#progressive-enhancement) is the way to have something work using an advanced piece of functionality when available, but also fallback to work in other situations (eg low data, no JS). eg: font fallbacks in CSS if the primary font is not available.

## [enhance](https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance)

Almost comically simply, import and use:

```javascript
<script>
    import { enhance } from "$app/forms";
</script>

<form use:enhance method="POST">
	//...as above
```

This intercepts a form request for progressive enhancement.  Without an argument, use:enhance will emulate the browser-native behaviour, just without the full-page reloads.

This sends a POST request to a URL, specifically the URL of your route. It _also_ sends a GET request:

```
[logger] POST /contact. Took 5ms
[logger] GET /contact. Took 1ms
```

```enhance``` attaches JS to the form to:
1.  prevent default refresh on submit (essentialy[ preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)).
2. updates form property in svelte page store: (```$page.form``` and ```$page.status```) and , if form successful.
3. Reset the \<form\> element and invalidate all data using ```invalidateAll``` on a successful response.
4. call ```goto``` on a redirect response
5. render the nearest ```+error``` boundary if an error occurs
6. [reset focus](https://kit.svelte.dev/docs/accessibility#focus-management) to the appropriate element


# [Failing Forms and the Form Prop](https://levelup.video/tutorials/sveltekit/failing-forms-and-the-form-prop)

You might want to invalidate a form for many reasons, eg: user submits form but they do not have correct access level.

To use, update ```src/routes/contact/+page.server.js```:

```javascript
import { fail } from '@sveltejs/kit';


export const actions = {
    default: async ( { locals, request }) => {
        const data = await request.formData();
        // check if the request is a POST request
        if(!locals?.user?.roles?.includes('admin')) { // if user roles does not include admin as a role, fail
            return fail(401, {
                message: 'Unauthorized'});
        };


        const name = data.get('name');
        const email = data.get('email');
        const message = data.get('message');
        console.log('contact page server action', name, email, message);

        return {
            message: ```Email sent!```
        }
    }
}
```

Note: ```message``` in the return is not an essential keyword. You can call it whatever you like. Also not to test, you need to update hooks.server.js to not pass across a user:

```javascript
function authorize({ event, resolve }) {
    const user = auth();
   // event.locals.user = user; // comment this line
    return resolve(event);
}
```

This isn't displayed yet, but heading to dev tools -> network -> Fetch/XHR -> choose 'contact' request -> Response tab: ```{"type":"failure","status":401,"data":"[{\"message\":1},\"Unauthorized\"]"}```

To display the info: [form prop](https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action).

In ```src/routes/contact/+page.svelte```:

```javascript
<script>
    import { enhance } from "$app/forms";

    export let form;
    $: console.log('form', form);
</script>

```

Browser console now logs a form property, containing ```{message: 'Unauthorized'}```.

To display error message, add below above script:

```javascript
{#if form?.message}
	<p>{form.message}</p>
{/if}
```

And now, if ```form.message``` exists, 'Unauthorized' displays on the page.

Aaaand now update:

1. hooks.server.js
- uncomment event.locals.user = user;


```javascript
function authorize({ event, resolve }) {
    const user = auth();
    event.locals.user = user;
    return resolve(event);
}
```

2. src/routes/contact/+page.server.js
- update if clause to ```if(!locals?.user)``` as there isn't an admin role. In other words: create a success state.
- for clarity, rename the final return from ```message``` -> ```success_message```.

```javascript

import { fail } from '@sveltejs/kit';

export const actions = {
    default: async ( { locals, request }) => {
        const data = await request.formData();
        // check if the request is a POST request
        if(!locals?.user) { // if user does not exist, fail
            return fail(401, {
                error_message: 'Unauthorized'});
        };

        const name = data.get('name');
        const email = data.get('email');
        const message = data.get('message');
        console.log('contact page server action', name, email, message);

        return {
            success_message: ```Email sent!```
        }
    }
}
```

3. src/routes/contact/+page.svelte
- second if clause shows ```Message sent!``` if message sent successfully, as well as returning ```form.success_message```
- ```{:else}``` clause redisplays form is ```form.success_message``` is not present, ie if message fails.

```javascript
// script unchanged

{#if form?.error_message}
	<p>Error{form.error_message}</p>
{/if}

{#if form?.success_message}
	<p>Message sent!</p>
	<p>{form.success_message}</p>
{:else}
	<form use:enhance method="POST">
		<label>
			Name:
			<input type="text" name="name" id="name" required />
		</label>
		<label>
			Email:
			<input type="email" name="email" id="email" required />
			<label>
				Message:
				<textarea name="message" id="message" required />
			</label>
		</label>
		<button type="submit">Send</button>
	</form>
{/if}

// style unchanged
```

#[Enhance Options and Named Actions](https://levelup.video/tutorials/sveltekit/enhance-options-and-named-actions)

### Why augment use:enhance?
1. it gives you more control, eg custom messages
2. augment data before form is submitted

### How?
pass in a callback!
Options:
- ```formElement```: access the form element
- ```formData```: the FormData object that's about to be submitted
- ```action```: the url form posts to
- ```cancel```: prevents submission
- ```submitter```: the HTMLElement that caused the form to be submitted

In ```src/routes/contact/+page.svelte```:

```javascript
<form use:enhance={({ form, data, action, cancel }) => {

        return ({result, update}) => {
			update(); // runs default use:enhance functions
        }
    }} method="POST">

    </form>
```

The return returns a function, which allows access
- ```result```: the '[ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult)' object, ie tells you if you have a success or error type, and status
- ```update```: a function that runs all the default use:enhance functions.

The above only has ```update()``` called, so it should behave exactly as per the standard ```use:ehance```.

## You can have as many actions as you want per route

So far, we have a POST request to the default route, so the default action is used. You can add query parameter with a [Named action](https://kit.svelte.dev/docs/form-actions#named-actions) to enable multiple different parameters per route.

So, in ```src/routes/conact/+page.server.js```
1. create ```testAction``` by adding to the export const actions object.
2. rename ```default``` action, as you can either have default or named actions

```javascript
export const actions = {
    email: async ( { locals, request }) => {
        const data = await request.formData();
        // check if the request is a POST request
        if(!locals?.user) { // if user does not exist, fail
            return fail(401, {
                error_message: 'Unauthorized'});
        };


        const name = data.get('name');
        const email = data.get('email');
        const message = data.get('message');
        console.log('contact page server action', name, email, message);

        return {
            success_message: ```Email sent!```
        }
    },
    testAction: () => {
        console.log('test action firing');
        }
}
```

aaaand to hit the action, in ```src/routes/conact/+page.svelte```:

```javascript
	<form
		use:enhance
		action="?/testAction"
   		method="POST">
   	// form
   	</form>
```

You might want to do this for forms that handle login and sign up and you want to differentiate them.


# [Custom Form Handlers](https://levelup.video/tutorials/sveltekit/custom-form-handlers)


## Custom path
Sometimes, forms need a custom path as well as a custom action. By default, it sends to the same URL as the form. So, the above endpoint can be hit _from any page_ by updating the action to ```action"/contact?/email"```.

Rest of video is about how to write custom handlers using HTML handlers instead of ```use:ehance```.
