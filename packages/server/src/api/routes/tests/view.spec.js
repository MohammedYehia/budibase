const { 
  createClientDatabase,
  createApplication,
  createInstance, 
  createTable,
  supertest,
  defaultHeaders,
  getDocument
} = require("./couchTestUtils")

describe("/views", () => {
  let request
  let server
  let app
  let instance
  let table

  const createView = async (config = {
    name: "TestView",
    field: "Price",
    calculation: "stats",
    tableId: table._id
  }) => 
    await request
    .post(`/api/views`)
    .send(config)
    .set(defaultHeaders(app._id, instance._id))
    .expect('Content-Type', /json/)
    .expect(200)

  const createRow = async row => request
    .post(`/api/${table._id}/rows`)
    .send(row)
    .set(defaultHeaders(app._id, instance._id))
    .expect('Content-Type', /json/)
    .expect(200)

  beforeAll(async () => {
    ({ request, server } = await supertest())
    await createClientDatabase(request)
    app = await createApplication(request)
  })

  beforeEach(async () => {
    instance = await createInstance(request, app._id)
  })

  afterAll(async () => {
    server.close()
  })

  describe("create", () => {
    beforeEach(async () => {
      table = await createTable(request, app._id, instance._id);
    })

    it("returns a success message when the view is successfully created", async () => {
      const res = await createView()
      expect(res.res.statusMessage).toEqual("View TestView saved successfully.");
    })

    it("updates the table row with the new view metadata", async () => {
      const res = await createView()
      expect(res.res.statusMessage).toEqual("View TestView saved successfully.");
      const updatedTable = await getDocument(instance._id, table._id)
      expect(updatedTable.views).toEqual({
        TestView: {
          field: "Price",
          calculation: "stats",
          tableId: table._id,
          filters: [],
          schema: {
            sum: {
              type: "number",
            },
            min: {
              type: "number",
            },
            max: {
              type: "number",
            },
            count: {
              type: "number",
            },
            sumsqr: {
              type: "number",
            },
            avg: {
              type: "number",
            },
            field: {
              type: "string",
            },
          }
        }
      });
    })
  });

  describe("fetch", () => {
    beforeEach(async () => {
      table = await createTable(request, app._id, instance._id);
    });

    it("returns only custom views", async () => {
      await createView()
      const res = await request
        .get(`/api/views`)
        .set(defaultHeaders(app._id, instance._id))
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.body.length).toBe(1)
      expect(res.body.find(({ name }) => name === "TestView")).toBeDefined()
    })
  });

  describe("query", () => {
    beforeEach(async () => {
      table = await createTable(request, app._id, instance._id);
    });

    it("returns data for the created view", async () => {
      await createView()
      await createRow({
        tableId: table._id,
        Price: 1000
      })
      await createRow({
        tableId: table._id,
        Price: 2000
      })
      await createRow({
        tableId: table._id,
        Price: 4000
      })
      const res = await request
        .get(`/api/views/TestView?calculation=stats`)
        .set(defaultHeaders(app._id, instance._id))
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.body.length).toBe(1)
      expect(res.body).toMatchSnapshot()
    })

    it("returns data for the created view using a group by", async () => {
      await createView({
        calculation: "stats",
        name: "TestView",
        field: "Price",
        groupBy: "Category",
        tableId: table._id
      })
      await createRow({
        tableId: table._id,
        Price: 1000,
        Category: "One"
      })
      await createRow({
        tableId: table._id,
        Price: 2000,
        Category: "One"
      })
      await createRow({
        tableId: table._id,
        Price: 4000,
        Category: "Two"
      })
      const res = await request
        .get(`/api/views/TestView?calculation=stats&group=Category`)
        .set(defaultHeaders(app._id, instance._id))
        .expect('Content-Type', /json/)
        .expect(200)
      
      expect(res.body.length).toBe(2)
      expect(res.body).toMatchSnapshot()
    })
  });
});