#!/usr/bin/env python3
"""Replace old Feedback Section with new Comments section in AppDetail.tsx"""

f = r'c:\Users\imran\StudioProjects\designforge2\src\pages\community\AppDetail.tsx'

with open(f, 'r', encoding='utf-8') as fh:
    content = fh.read()

old_start = '{/* Comments Section */}'
old_end = '{/* Feedback List */}'

start_idx = content.index(old_start)
end_idx = content.index(old_end)

new_block = """{/* Comments Section */}
            <div className="border-t border-white/[0.06] pt-8">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <MessageSquare size={18} className="text-white/40" />
                Comments
                <span className="text-sm text-white/30 font-normal">({feedback.length})</span>
              </h2>

              {/* Always-visible comment box */}
              {user && !isOwner && !feedbackLocked && !alreadyCommented && (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(); }}
                  className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  <textarea
                    ref={commentRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Write a comment\u2026"
                    className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/30 focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-white/25">{commentText.length}/2000</span>
                    <button
                      type="submit"
                      disabled={feedbackLoading || commentText.trim().length < 40}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Send size={14} />
                      {feedbackLoading ? "Posting\u2026" : "Comment"}
                    </button>
                  </div>
                </form>
              )}

              {feedbackLocked && !isOwner && (
                <p className="text-xs text-amber-400/60 mb-6">Comments are closed</p>
              )}

              {user && isOwner && (
                <p className="text-xs text-white/30 mb-6">You can\u2019t comment on your own app.</p>
              )}

              {!user && (
                <Link
                  to="/signin"
                  className="block text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
                >
                  Sign in to comment
                </Link>
              )}

              {feedbackError && (
                <p className="text-sm text-red-400/80 bg-red-500/10 px-4 py-2.5 rounded-xl mb-6">{feedbackError}</p>
              )}

              {alreadyCommented && (
                <p className="text-xs text-emerald-400/60 mb-6">Your comment has been posted.</p>
              )}

              """

content = content[:start_idx] + new_block + content[end_idx:]

# Also rename "Feedback List" to "Comments List"
content = content.replace('{/* Feedback List */}', '{/* Comments List */}')

# Replace "Feedback Rate" to "Comment Rate"
content = content.replace('Feedback Rate', 'Comment Rate')

# Replace "No feedback yet" text
content = content.replace(
    'No feedback yet. Be the first to try this app!',
    'No comments yet. Be the first to share your thoughts!'
)

# Fix closing tags: after </motion.div> we need </main> then </div> for flex, </div> for container, </div> for min-h-screen
# Currently it's: </motion.div>\n        </div>\n      </div>
# Should be: </motion.div>\n        </main>\n        </div>\n        </div>\n      </div>
old_close = '          </motion.div>\n        </div>\n      </div>\n\n      {/* Full-screen'
new_close = '          </motion.div>\n        </main>\n        </div>\n        </div>\n      </div>\n\n      {/* Full-screen'
content = content.replace(old_close, new_close)

with open(f, 'w', encoding='utf-8') as fh:
    fh.write(content)

print('Done - all replacements applied successfully')
