import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingTier {
  title: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
  buttonVariant: "default" | "outline";
}

const pricingTiers: PricingTier[] = [
  {
    title: "Стандарт",
    price: "9 000 ₸",
    period: "/мес",
    features: [
      "Полный доступ к вебинарам",
      "Материалы вебинаров",
      "Поддержка кураторов",
      "Сертификат об окончании"
    ],
    buttonVariant: "outline"
  },
  {
    title: "Бизнес",
    price: "29 000 ₸",
    period: "/мес",
    features: [
      "Все из тарифа Стандарт",
      "Персональный наставник",
      "Проверка домашних заданий",
      "Дополнительные материалы",
      "Приоритетная поддержка",
      "Групповые консультации"
    ],
    highlighted: true,
    popular: true,
    buttonVariant: "default"
  },
  {
    title: "Конструктор",
    price: "Индивидуально",
    features: [
      "Гибкий выбор модулей",
      "Персональная программа",
      "Прямая работа с экспертами",
      "Скорректированные дедлайны",
      "Специальные условия для команд"
    ],
    buttonVariant: "outline"
  }
];

export function PricingSection() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Тарифный план
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Выберите подходящий для вас план и пользуйтесь всеми преимуществами
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {pricingTiers.map((tier, index) => (
          <Card
            key={index}
            className={`relative transition-all duration-300 ${
              tier.highlighted
                ? 'border-2 border-primary shadow-xl shadow-primary/20 md:scale-105 z-10 bg-gradient-to-br from-isra-medium to-isra-dark'
                : 'border border-border/50 shadow-lg bg-isra-medium/80 hover:shadow-xl'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm shadow-lg shadow-primary/30">
                  Популярный
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold mb-2">
                {tier.title}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-base text-muted-foreground ml-1">
                    {tier.period}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 border border-primary/30">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground leading-tight">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full mt-6 transition-all duration-300 ${
                  tier.buttonVariant === "default"
                    ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
                    : "border border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105"
                }`}
                variant={tier.buttonVariant}
                size="lg"
              >
                Выбрать
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}