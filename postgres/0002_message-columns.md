# Message Table New Columns
## parent_id
- When Reposting (with or without body)
- So, if a Message has a Perent ID, we know its a repost (and should not have the 'is_reply' flag set)
- any subsequent Reply/Repost will alway use the original ParentID field for their parent ID (if set)
## is_reply
- 'Reply' type messages are shown separately under the parent message
- These should always have a Body set