import GithubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { createHash } from "crypto";
import axios, { AxiosResponse } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { JWT } from "next-auth/jwt";
import { headers } from "next/headers";

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
        console.log(`api_base_url: ${process.env.VERCEL_URL || process.env.LOCAL_API_BASE_URL}`);
        return await axios.get(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://${process.env.LOCAL_API_BASE_URL}`}/api/get-user`, {
          headers: {
            'username': credentials!.username,
            'passhash': hash.update(credentials!.password).digest('hex'),
          },
        }).then(async(res: AxiosResponse) => {
          const { data: user, status } = res;
          console.log(`user: ${Object.keys(user)}`);
          console.log(`status: ${status}`);
          if(status !== 200){
            throw new Error('Authorize failed');
          }
          return user;
        }).catch(e=>{
          console.log(e);
          return null;
        });
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
