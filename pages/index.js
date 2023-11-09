import { MongoClient } from "mongodb";
import Head from "next/head";

import MeetupList from "@/components/meetups/MeetupList";
import { Fragment } from "react";

function HomePage(props) {
  return (
    <Fragment>
      <Head>
        <title>React Meetups</title>
        <meta
          name="description"
          content="Browse a huge list of highly active React meetups!"
        />
      </Head>
      <MeetupList meetups={props.meetups} />
    </Fragment>
  );
}

// [SSG vs SSR] 데이터 변경 주기나 request 객체에 대한 엑세스가 있는지 여부에 따라 선택!

// 1. SSG (Static Site Generation) - 사전 렌더링

// 대기 시간이 필요한 data도 사전 렌더링 페이지에 포함되도록 하는 방법
// pages 폴더 내 컴포넌트 파일에서만 작동함
// build 과정에만 실행됨 (Credential이 노출되지 않아 보안에 좋음)
// 불필요한 페이지 재생성 방지, 캐싱의 장점 이용할 수 있다.

export async function getStaticProps() {
  // 파일 시스템 엑세스, DB에 연결하는 등 서버에서 실행될 수 있는 코드 작성 가능

  // fetch data from an API or DB

  // fetch('/api/meetups') 같은 거 사용하지 않고, 직접 DB에 연결하여 데이터를 가져옴)
  // WHY? pages 컴포넌트 파일에 MongoClient를 import 한 것이 getStaticProps나 getServerSideProps에서만 쓰이면
  // -> Import된 패키지는 client side bundle에 포함되지 않음 (번들 크기, 보안에 좋음)
  // 즉, 서버에서만 실행되는 코드를 import할 수 있음
  const client = await MongoClient.connect(process.env.DATABASE_URL);

  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  const meetups = await meetupsCollection.find().toArray(); // 모든 데이터를 가져옴

  client.close();

  return {
    props: {
      // mongoDB에 id가 이상한 객체 형태이므로 변형해주자
      meetups: meetups.map((meetup) => ({
        title: meetup.title,
        address: meetup.address,
        image: meetup.image,
        id: meetup._id.toString(),
      })),
    },
    // 데이터 업데이트 주기에 따라 설정 -> 배포 후에도 페이지가 주기에 따라 업데이트 되도록
    revalidate: 1, // 1초 마다 재생성
  };
}

// 2. SSR (Server Side Rendering) - 동적 렌더링

// 배포 후 상시 서버 상에 존재. 매 요청마다 실행됨
// 서버에서만 실행되는 코드 (클라이언트에 노출되면 안되는 Credential이 포함될 작업 또한 실시 가능) / build 과정에서 실행 X
// 구체적인 request 객체에 대한 액세스가 있을 떄에만 사용 (매 요청마다 페이지를 새로 생성하면 비효율, 느릴 수 있음)

// export async function getServerSideProps(context) {
//   const req = context.req;
//   const res = context.res;

//   // fetch data from an API or DB

//   return {
//     props: {
//       meetups: DUMMY_MEETUPS,
//     },
//   };
// }

export default HomePage;
