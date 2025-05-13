
# Message View Table
- track message Views, Likes and Bookmarks on a single table
    - becuase it tracks the activity on a single record - rather than having multiple records tracking different things - this is an opinionated design choice
- a Message is 'Viewed' when the user 'sees' the message - so we must call a bach upsert to these records after a Fetch on a specific viewable subset
- a Message is 'Liked' when the user 'likes' the message
- a Message is 'Bookmarked' when the user 'bookmarks' the message
