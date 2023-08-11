---
title: Web Workers
description: Web workers are background scripts that run in a separate thread from the main page, allowing async / computation-intensive tasks to be carried out in isolation.
date: 2023-08-11
tags:
    - web workers
    - notes
---

Web workers are a way to run JavaScript code in the background, without blocking the main thread. They are useful for running expensive operations, such as searching, without blocking the main thread. They are also useful for running code that is not needed immediately, such as code that is only needed when a user clicks a button. They communicate with the main thread via the [Worker interface postMessage() method and the onmessage event handler](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage).
