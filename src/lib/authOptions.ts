import GithubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { createHash } from "crypto";

// https://zenn.dev/okumura_daiki/articles/c9e0065716d862

export const authOptions = {
  providers: [
    // GithubProvider({
    //   clientId: process.env.AUTH_GITHUB_ID!,
    //   clientSecret: process.env.AUTH_GITHUB_SECRET!,
    // }),
    Credentials({
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        const hash = createHash('sha512');
        return fetch(`${process.env.NEXTAUTH_URL}/api/get-user`, {
          method: 'GET',
          headers: {
            'username': credentials!.username,
            'passhash': hash.update(credentials!.password).digest('hex'),
          },
        }).then(async(res: any) => {
          if(!res.ok){
            throw new Error(res.error);
          }
          const user = await res.json();
          return user;
        }).catch(e=>{
          return null;
        })
        // const user = findUserByCredentials(credentials);
        // if (user) {
        //   // 返されたオブジェクトはすべてJWTの`user`プロパティに保存される
        //   return user;
        // } else {
        //   return null;// 認証拒否
        //   // return Promise.reject(new Error('error message')) // エラーページにリダイレクト
        //   // return Promise.reject('/path/to/redirect')        // URL にリダイレクト
        // }
      },
    }),
  ],

  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt" as const,
  },

  jwt: {},

  pages: {},

  callbacks: {},

  events: {},

  debug: false,
}
