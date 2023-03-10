# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html) (CLI) which lets you scaffold and manage your project in seconds.

### `install dependencies`

```
npm install
```

### `configure env`

```
for example rename .env.example to .env
```

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-build)

```
npm run build
# or
yarn build
```

## :student: Usage

After app runs you can use `strapi.postman_collection.json`. There are available routes, methods and some variables aka {{jwt_token}} in that collection for logged in user.

### Allowed actions: 

1) When you run the app first time you will be redirected to admin panel, where you must create Super Admin. After this Super Admin should create a new user with 'Editor' role. By default editors have flag canPublish - true.
2) New editor can log in into API via endpoint `Login user` and fields `identifier` - username or email and `password`.
3) Editor can create new author via endpoint `Create author` with required fields: `username`, `email`, `password`. Editor can set flag `canPublish` = `true` for author. By default this flag is `false`.
4) Editors have access to endpoint `Edit author` for editing authors.
5) Author has access to endpoint `Change password` for changing his own password.
6) All registered users can create new publication via endpoint `Create publication` with required field `title` and optional field `content`.
7) After creation a new publication is a draft. And author can publish it only after editor set flag `canPublish` = `true` via endpoint `Edit author`. After this author can publish his own publication with endpoint `Edit publication` and field `publish` with value `true`. With this endpoint author can update his own publication.
8) Author can remove his own publication via endpoint `Remove publication`.
9) Author can see all published publications and all his drafts via endpoint `Get all publications`.
10) Editor can see, edit and remove all publications of all authors.

### Allowed endpoints and methods:

#### :family_man_woman_girl_boy: Operations with users

- `Login user`: `{{server}}/api/auth/local` - method: `POST`
- `Create author`: `{{server}}/api/auth/local/register` - method: `POST`
- `Get All users`: `{{server}}/api/users` - method: `GET`
- `Edit author`: `{{server}}/api/users/id` - method: `PUT`
- `Change password`: `{{server}}/api/auth/change-password` - method: `POST`

#### :bookmark_tabs: Operations with publications

- `Get all publications`: `{{server}}/api/publications` - method: `GET`
- `Get publication by id`: `{{server}}/api/publications/id` - method: `GET`
- `Create publication`: `{{server}}/api/publications` - method: `POST`
- `Edit publication`: `{{server}}/api/publications/id` - method: `PUT`
- `Remove publication`: `{{server}}/api/publications/id` - method: `DELETE`


## ⚙️ Deployment

Strapi gives you many possible deployment options for your project. Find the one that suits you on the [deployment section of the documentation](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.html).

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://docs.strapi.io) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
