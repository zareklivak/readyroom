// Highlight the words in a source snippet that support a given claim — the
// "claim text highlighted" behavior in the citation slide-over. We don't have
// span-level provenance from the model, so we approximate: the meaningful tokens
// the claim and source share are the supporting text. It's a heuristic, but it
// reliably lands the eye on the right sentence — the whole point of the interaction.

export interface Segment {
  text: string;
  hit: boolean;
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "they", "their", "them", "from",
  "into", "your", "you", "are", "was", "were", "will", "would", "have", "has",
  "had", "not", "but", "who", "what", "when", "where", "how", "why", "his",
  "her", "she", "him", "our", "out", "off", "own", "can", "she's", "its", "it's",
  "one", "two", "all", "any", "get", "got", "let", "yes", "yeah", "okay", "just",
  "about", "there", "here", "than", "then", "some", "more", "much", "very",
  "been", "being", "does", "did", "doing", "over", "under", "onto", "even",
]);

function claimTerms(claim: string): Set<string> {
  const terms = new Set<string>();
  for (const raw of claim.toLowerCase().match(/[a-z0-9']+/g) ?? []) {
    const w = raw.replace(/^'+|'+$/g, "");
    if (w.length >= 4 && !STOPWORDS.has(w)) terms.add(w);
  }
  return terms;
}

/** Split the source into segments, marking runs of claim-supporting words. */
export function highlightSegments(source: string, claim: string): Segment[] {
  const terms = claimTerms(claim);
  const tokens = source.split(/(\s+)/); // keep whitespace tokens
  const segments: Segment[] = [];

  for (const token of tokens) {
    const bare = token.toLowerCase().replace(/[^a-z0-9']/g, "");
    const hit = bare.length >= 4 && terms.has(bare);
    const last = segments[segments.length - 1];
    if (last && last.hit === hit) {
      last.text += token;
    } else {
      segments.push({ text: token, hit });
    }
  }
  return segments;
}
