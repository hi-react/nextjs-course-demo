import MeetupDetail from "@/components/meetups/MeetupDetail";
import { MongoClient, ObjectId } from "mongodb";
import Head from "next/head";
import { Fragment } from "react";

function MeetupDetails(props) {
  return (
    <Fragment>
      <Head>
        <title>{props.meetupData.title}</title>
        <meta name="description" content={props.meetupData.description} />
      </Head>
      <MeetupDetail
        image={props.meetupData.image}
        title={props.meetupData.title}
        address={props.meetupData.address}
        description={props.meetupData.description}
      />
    </Fragment>
  );
}

// 모임 약속은 데이터가 매번 변경되지 않는 것으로 가정
// SSG -> getStaticProps()를 사용하여 사전 렌더링

// getStaticProps로 '동적 페이지' 경로 매개변수 작업하기 (getStaticPaths)

// 해당 '동적 페이지'의 모든 버전을 사전 생성해야 함
// getStaticPaths: 어떤 Id 값에 대해 페이지가 사전 생성되어야 하는 지 알기 위해 사용
export async function getStaticPaths() {
  // mongoDB 연결, meetups 컬렉션 데이터에 접근해서 경로 배열을 동적으로 생성해보자!
  const client = await MongoClient.connect(process.env.DATABASE_URL);

  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  const meetups = await meetupsCollection.find({}, { _id: 1 }).toArray(); // 모든 데이터를 가져올 건데(filtering 안할거니까 빈 객체), id만 가져오겠다.

  client.close();

  return {
    // 특정 meetupId 값에 대한 페이지만 사전 생성하도록 설정할 수 있게 함 (방문이 잦은 페이지에만 적용하는 것이 좋고, 나머지는 요청이 입력되었을 때 동적으로 사전 생성)
    // fallback: false -> 지원되는 모든 paths를 정의했다고 설정
    fallback: false,
    paths: meetups.map((meetup) => ({
      params: {
        meetupId: meetup._id.toString(),
      },
    })),
  };
}

export async function getStaticProps(context) {
  // fetch data for a single meetup

  // meetupId는 해당 대괄호로 설정해 놓은 identifier
  const meetupId = context.params.meetupId;

  // node 터미널에서만 확인 가능 (getStaticProps는 build 과정에서만 실행되기 때문에)
  console.log(meetupId);

  // mongoDB 연결, meetups 컬렉션 데이터에 접근해서 데이터를 동적으로 생성해보자!
  const client = await MongoClient.connect(process.env.DATABASE_URL);

  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  const selectedMeetup = await meetupsCollection.findOne({
    _id: new ObjectId(meetupId),
  });

  console.log(selectedMeetup);

  client.close();

  return {
    props: {
      meetupData: {
        title: selectedMeetup.title,
        address: selectedMeetup.address,
        image: selectedMeetup.image,
        description: selectedMeetup.description,
        id: selectedMeetup._id.toString(),
      },
    },
  };
}

export default MeetupDetails;
