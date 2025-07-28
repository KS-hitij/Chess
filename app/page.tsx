import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { getServerSession } from "next-auth";
import SignInBtn from "./components/SignInBtn";
import SignOutBtn from "./components/SignOutBtn";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";

type Article = {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string; 
  content: string;
};

export default async function Home() {
  const result = await axios.get(`https://newsapi.org/v2/everything?q="Chess Tournament"&sortBy=popularity&pageSize=4&apiKey=${process.env.NEWS_API_KEY}`);
  const articles:Article[] = result.data.articles;
  const session = await getServerSession(authOptions);
  return (
    <div className="min-h-screen max-w-screen bg-base-300 overflow-x-hidden">
      <div className="navbar border-b-1 border-gray-300  justify-between lg:px-20 mb-10 lg:mb-20">
        <div className="flex navbar-start h-full items-center">
          <h1 className="text-2xl lg:text-4xl font-bold">Chess</h1>
        </div>
        <div className="flex h-full navbar-end items-center gap-x-4">
          {session?<SignOutBtn/>:<SignInBtn/>}
          <button type="button" className="btn btn-primary rounded-xl hover:shadow-xl transition duration-300 lg:btn-lg"><Link href={"/leaderboard"}>Leaderboard</Link></button>
        </div>
      </div>
      <div className="flex-col flex lg:flex-row lg:justify-center w-full gap-[3rem] lg:gap-[8rem] items-center mb-20">
        <Image src={"/hero.png"} alt="hero" width={400} height={400} />
        <div className="flex flex-col items-center gap-y-3">
          <h1 className="text-5xl lg:text-6xl font-bold break-words text-balance text-center">Play Chess Online <br /> on the #1 site.</h1>
          <button type="button" className="btn btn-primary rounded-xl hover:shadow-xl transition duration-300 btn-lg mt-2"><Link href={session?"/game/public":"/auth"}>Play Online</Link></button>
          <h1 className="text-xl">Or</h1>
          <button type="button" className="btn btn-primary rounded-xl hover:shadow-xl transition duration-300 btn-lg"><Link href={"/lobby"}>Play With A Friend</Link></button>
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        <h1 className="lg:text-5xl text-3xl font-bold max-h-100 text-center mb-8 flex flex-wrap">Follow What&#39;s Happening On Chess Today</h1>
        <div className="flex flex-wrap justify-center items-center gap-x-5 w-full lg:w-[50%]">
          {articles.map((article) => {
            return (
              <div key={article.url} className="card bg-base-100 w-80 shadow-md pb-2 mb-10 cursor-pointer hover:shadow-xl transition duration-300">
                <Link href={article.url}>
                  <figure>
                    <img height={150} width={200} loading="lazy"  src={article.urlToImage} alt="News" />
                  </figure>
                  <div className="card-body">
                    <p>{article.title}</p>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div >
  )
}
