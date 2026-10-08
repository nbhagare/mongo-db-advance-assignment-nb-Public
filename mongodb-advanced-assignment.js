Task 1: Schema Validation and Data Creation

Step 1:  Create fresh database
use company_advanced

Step 2: Create validated employees collection
db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "name",
        "departmentId",
        "experience",
        "active"
      ],
      properties: {
        name: {
          bsonType: "string"
        },
        departmentId: {
          bsonType: "int"
        },
        experience: {
          bsonType: "int"
        },
        active: {
          bsonType: "bool"
        }
      }
    }
  }
})


Step 3: Insert the Starting Dataset
db.employees.insertMany([
  {
    _id: 1,
    name: "John",
    departmentId: 10,
    skills: ["Java", "MongoDB"],
    experience: 4,
    active: true,
    certifications: [
      { name: "MongoDB", status: "Expired", expiryYear: 2026 }
    ]
  },
  {
    _id: 2,
    name: "Alice",
    departmentId: 10,
    skills: ["Python"],
    experience: 6,
    active: true,
    certifications: [
      { name: "MongoDB", status: "Active", expiryYear: 2028 }
    ]
  },
  {
    _id: 3,
    name: "David",
    departmentId: 20,
    skills: ["Communication"],
    experience: 3,
    active: false,
    certifications: [
      { name: "Communication", status: "Active", expiryYear: 2027 }
    ]
  }
])



Step 4: Test the Validation Rule
db.employees.insertOne({
  _id: 99,
  name: 123,
  departmentId: "HR",
  experience: "one",
  active: "yes"
})


Task 2: Advanced Array Queries and Updates

2.1 Find One Matching Array Object
Use $elemMatch to find employees whose certifications contain the same object with name: "MongoDB" and status: "Active".

db.employees.find({
  certifications: {
    $elemMatch: { name: "MongoDB", status: "Active" }
  }
})



2.2 Update One Matching Array Element
Use the positional $ operator to change John's MongoDB certification status from Expired to Active .

db.employees.updateOne(
  { _id: 1, "certifications.name": "MongoDB" },
  { $set: { "certifications.$.status": "Active" } }
)

db.employees.find({ _id: 1 }, { name: 1, certifications: 1 })


2.3 Update Selected Array Elements
Use arrayFilters to change the status to Renewal expiryYear is less than 2027 .
Due for certification elements whose

db.employees.updateMany(
  { "certifications.expiryYear": { $lt: 2027 } },
  { $set: { "certifications.$[cert].status": "Renewal Due" } },
  { arrayFilters: [ { "cert.expiryYear": { $lt: 2027 } } ] }
)


db.employees.find({ _id: 1 }, { name: 1, certifications: 1 })

Task 3: Bulk Write Operations
Use one bulkWrite() call to complete all three operations:
1. Increase John's experience by 1 .
2. Set Alice's active value to false .
3. Insert Emma using the document below.


db.employees.bulkWrite([
  {
    updateOne: {
      filter: { _id: 1 },
      update: { $inc: { experience: 1 } }
    }
  },
  {
    updateOne: {
      filter: { _id: 2 },
      update: { $set: { active: false } }
    }
  },
  {
    insertOne: {
      document: {
        _id: 4,
        name: "Emma",
        departmentId: 20,
        skills: ["Excel"],
        experience: 2,
        active: true,
        certifications: [
          { name: "Excel", status: "Active", expiryYear: 2026 }
        ]
      }
    }
  }
])


Verification queries
db.employees.findOne({ _id: 1 }, { name: 1, experience: 1 })
db.employees.findOne({ _id: 2 }, { name: 1, active: 1 })
db.employees.countDocuments()


Task 4: Advanced Aggregation

Step 1: Create the Departments Collection
Insert the following documents into a departments collection:

db.departments.insertMany([
  { _id: 10, name: "Engineering" },
  { _id: 20, name: "HR" }
])
db.departments.find()


4.1 Join Employees with Departments
Build an aggregation pipeline using $lookup and $unwind .
- Join employees.departmentId with departments. _id.
- Return employee name and departmentName only.
- Sort by employee name in ascending order.


db.employees.aggregate([
  {
    $lookup: {
      from: "departments",
      localField: "departmentId",
      foreignField: "_id",
      as: "department"
    }
  },
  { $unwind: "$department" },
  {
    $project: {
      _id: 0,
      name: 1,
      departmentName: "$department.name"
    }
  },
  { $sort: { name: 1 } }
])


4.2 Count Employees for Each Skill
Use $unwind on skills , group by skill, count employees, and sort by count descending. For equal
counts, sort the skill name ascending.

db.employees.aggregate([
  { $unwind: "$skills" },
  {
    $group: {
      _id: "$skills",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1, _id: 1 } }
])


4.3 Return Active Employees and a Count
Use $facet to return both active employee names and the total active employee count in one pipeline.
Sort names ascending.


db.employees.aggregate([
  { $match: { active: true } },
  {
    $facet: {
      activeEmployees: [
        { $sort: { name: 1 } },
        { $project: { _id: 0, name: 1 } }
      ],
      activeCount: [
        { $count: "total" }
      ]
    }
  }
])


Task 5: Indexing and Query Performance

5.1 Create and Verify a Compound Index
Create an ascending compound index on departmentId followed by name . Verify it using
getIndexes() .

Required index name: departmentId_1_name_1


db.employees.createIndex({ departmentId: 1, name: 1 })
db.employees.getIndexes()


5.2 Read explain("executionStats")
Run explain("executionStats") 
Record the following values in answers.md:
winning plan stage: COLLSCAN or IXSCAN
nReturned
totalDocsExamined
totalKeysExamined

Note: With a very small dataset, MongoDB may choose COLLSCAN even when an index exists. Report
the actual result shown on your machine.

>> Used printjson() is a built-in mongosh function that prints a JavaScript object to the console as formatted, indented JSON.

const exp = db.employees.find({ departmentId: 10 }).sort({ name: 1 }).explain("executionStats");
printjson({
  winningPlan: exp.queryPlanner.winningPlan,
  nReturned: exp.executionStats.nReturned,
  totalDocsExamined: exp.executionStats.totalDocsExamined,
  totalKeysExamined: exp.executionStats.totalKeysExamined
});



5.3 Create a TTL Index
Create a sessions collection, insert the document below, and create a TTL index on expiresAt with
expireAfterSeconds: 0.
Required TTL index name: expiresAt _1

Do not wait for the document to disappear. TTL cleanup runs in the background and may not happen
immediately.

db.sessions.insertOne({
  _id: 1,
  userName: "John",
  expiresAt: new Date(Date.now() + 600000)
})

db.sessions.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)
