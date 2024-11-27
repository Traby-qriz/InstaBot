<h1 align="center"> 𝐈𝐍𝐒𝐓𝐀-𝐁𝐎𝐓 </h1>
<h1 align="center"> 𝖵𝖤𝖱𝖲𝖨𝖮𝖭 1.0.0 </h1>

Automate Instagram login and session management with this efficient Node.js script.

## NB:
- Sometimes Instagram may detect suspicious login attempt and block it. Be aware of this.
- You may also encounter a checkpoint challenge but I've tried my best to bypass this.

## Features

1. **Automatic Login**: *Seamless Instagram authentication*
2. **Session Cookie Management**: *Efficient cookie handling*
3. **Customizable Device Profiles**: *Flexible device configuration*
4. **Error Handling**: *Robust logging and error management*


## Extensible Features

Developers can build upon InstaBot's foundation to add features such as:

1. `Auto-follow/unfollow`
2. `Auto-like/dislike`
3. `Auto-comment`
4. `Post scheduling`
5. `Story viewing`
6. `Hashtag tracking`
7. `User profiling`
8. `Engagement analytics`



## Requirements 

1. `Node.js` (>=14.17.0)
2. `instagram-private-api` library
3. `lolcatjs` library

## Installation 

1. Fork the repository [`Fork`](https://github.com/Dark-Xploit/InstaBot/fork)
   
2. Clone repository:
```
git clone https://github.com/Dark-Xploit/InstaBot.git
```
3. Install dependencies:
```
npm install
```
4. Edit `config.js` with Instagram credentials:

```
module.exports = {
  IG_USERNAME: 'your_username',
  IG_PASSWORD: 'your_password'
};
```

## Usage

1. Run script:
```
node index.js
```
2. InstaBot will login to Instagram and save session cookies, then keep your account active 24/7

## Security Considerations

1. Respect Instagram's Terms of Service and API usage policies.
2. Store sensitive user data securely.
3. Regularly update dependencies.

## License

MIT License

Copyright (c) 2024 [Tylor]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

## Support

1. Open an <a href="https://github.com/Dark-Xploit/InstaBot/issues">issue.</a></p>
2. Contact [`Email`](phantomtylor@gmail.com)
