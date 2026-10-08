Q1. Why is schema validation useful?
Answer: B. It rejects documents that do not follow required fields or data types.

Q2. What does $elemMatch help verify?
Answer: B. Multiple conditions match the same array object.

Q3. What is the purpose of arrayFilters?
Answer: C. To update selected array elements that match a condition.

Q4. When is bulkWrite() useful?
Answer: A. When several write operations should be sent together.

Q5. Which stage joins documents from another collection?
Answer: C. $lookup

Q6. What does IXSCAN usually indicate in explain() output?
Answer: B. MongoDB used an index.

Q7. What happens when abortTransaction() is called?
Answer: C. Uncommitted transaction changes are rolled back.

Q8. What does write concern w: "majority" mean?
Answer: B. A majority of voting data-bearing replica-set members acknowledge the write.

Q9. What normally happens when a replica-set Primary fails?
Answer: C. Eligible members hold an election for a new Primary.

Q10. Which is the best direction for choosing a shard key?
Answer: B. A high-cardinality field that distributes traffic and matches common queries.

Q11. What do Change Streams allow an application to do?
Answer: A. Listen for inserts, updates, replacements, and deletes.

Q12. Which is a good production-security practice?
Answer C. Use TLS, restricted network access, and least-privilege credentials.


### Task 5.2 – explain("executionStats") Values

- When I ran the query with explain("executionStats"), the winning plan stage was IXSCAN. This means MongoDB used the index departmentId_1_name_1 to find the data. It did not check every document one by one, so the query was fast.
- The nReturned value was 2. This means the query gave 2 documents as the result. These are Alice and John, because both of them are in department 10.
- The totalDocsExamined value was 2. This means MongoDB opened and read only 2 documents. It did not open any extra documents.
- The totalKeysExamined value was 2. This means MongoDB checked 2 entries in the index to find the matching documents.
- All three values (nReturned, totalDocsExamined and totalKeysExamined) are the same, which is 2. This shows that MongoDB did not do any extra work. The index is working properly, and the sorting on name was also done using the index, so no separate sort step was needed.
