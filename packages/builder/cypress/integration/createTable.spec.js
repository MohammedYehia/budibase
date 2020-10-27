context("Create a Table", () => {
  before(() => {
    cy.visit("localhost:4001/_builder")
    cy.createApp("Table App", "Table App Description")
  })

  it("should create a new Table", () => {
    cy.createTable("dog")

    // Check if Table exists
    cy.get(".title span").should("have.text", "dog")
  })

  it("adds a new column to the table", () => {
    cy.addColumn("dog", "name", "Text")
    cy.contains("name").should("be.visible")
  })

  it("creates a row in the table", () => {
    cy.addRow(["Rover"])
    cy.contains("Rover").should("be.visible")
  })

  it("updates a column on the table", () => {
    cy.contains("name").click()
    cy.get(".ri-pencil-line").click()
    cy.get(".actions input")
      .first()
      .type("updated")
    // Unset table display column
    cy.contains("display column").click()
    cy.contains("Save Column").click()
    cy.contains("nameupdated").should("have.text", "nameupdated")
  })

  it("edits a row", () => {
    cy.get("button").contains("Edit").click()
    cy.get(".modal input").type("Updated")
    cy.contains("Save").click()
    cy.contains("RoverUpdated").should("have.text", "RoverUpdated")
  })

  it("deletes a row", () => {
    cy.get(".ag-checkbox-input").check({ force: true })
    cy.contains("Delete 1 row(s)").click()
    cy.get(".modal").contains("Delete").click()
    cy.contains("RoverUpdated").should("not.exist")
  })

  it("deletes a column", () => {
    cy.contains("name").click()
    cy.get(".ri-pencil-line").click()
    cy.contains("Delete Column").click()
    cy.wait(50)
    cy.get(".buttons").contains("Delete Column").click()
    cy.contains("nameupdated").should("not.exist")
  })

  it("deletes a table", () => {
    cy.contains("div", "dog")
      .get(".ri-more-line")
      .click()
    cy.get("[data-cy=delete-table]").click()
    cy.contains("Delete Table").click()
    cy.contains("dog").should("not.exist")
  })
})
