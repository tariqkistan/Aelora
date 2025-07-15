"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Search, Users, TrendingUp, ArrowRight } from "lucide-react"

export default function AIRankingPreview() {
  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 border-2 border-dashed border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Crown className="h-6 w-6 text-yellow-500" />
          AI Search Rankings Preview
        </CardTitle>
        <p className="text-muted-foreground">
          After analyzing your website, see how your brand performs in AI assistant responses
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Preview metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">AI Questions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">8+</div>
              <div className="text-xs text-muted-foreground">analyzed queries</div>
            </div>
            
            <div className="bg-white/70 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Competitors</span>
              </div>
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-xs text-muted-foreground">tracked brands</div>
            </div>
            
            <div className="bg-white/70 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Insights</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">∞</div>
              <div className="text-xs text-muted-foreground">optimization tips</div>
            </div>
          </div>

          {/* Sample question preview */}
          <div className="bg-white/70 p-4 rounded-lg border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Sample AI Questions Users Ask:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">"Is [Your Brand] reliable for business needs?"</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    high volume
                  </Badge>
                  <span className="text-sm font-medium text-green-600">#3</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">"How does [Your Brand] compare to competitors?"</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    medium volume
                  </Badge>
                  <span className="text-sm font-medium text-yellow-600">#5</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">"What are the pros and cons of [Your Brand]?"</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    high volume
                  </Badge>
                  <span className="text-sm font-medium text-blue-600">#2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Ready to see your AI rankings?</h4>
            <p className="text-sm text-blue-100 mb-3">
              Analyze your website to discover how your brand performs in AI search results
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span>Enter your URL above to get started</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 