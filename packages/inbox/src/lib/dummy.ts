import { Email } from "@/components/inbox/types";
import { faker } from "@faker-js/faker";

export const getDummyEmails = (): Email[] => {
  return Array.from({ length: 100 }, (_, index) => {
    return {
      id: faker.string.uuid(),
      thread_id: faker.string.uuid(),
      from_email: faker.internet.email(),
      to_email: "brace@langchain.dev",
      subject: faker.lorem.sentence(),
      page_content: faker.lorem.paragraphs({ min: 2, max: 5 }),
      send_time: faker.date.recent().toISOString(),
      read: faker.datatype.boolean(),
      status: faker.helpers.arrayElement([
        "in-queue",
        "done",
        "hitl",
        "processing",
      ]),
    };
  });
};
